param(
    [int]$Port = 8080
)

$csharpCode = @"
using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using System.Collections.Generic;

public class StreamingServer
{
    private HttpListener _listener;
    private string _root;
    private Dictionary<string, string> _mimeTypes;
    private bool _running;

    public StreamingServer(int port, string root)
    {
        _root = root;
        _listener = new HttpListener();
        _listener.Prefixes.Add(string.Format("http://localhost:{0}/", port));
        _listener.Prefixes.Add(string.Format("http://127.0.0.1:{0}/", port));
        _mimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        _mimeTypes[".html"] = "text/html; charset=utf-8";
        _mimeTypes[".htm"] = "text/html; charset=utf-8";
        _mimeTypes[".css"] = "text/css; charset=utf-8";
        _mimeTypes[".js"] = "application/javascript; charset=utf-8";
        _mimeTypes[".json"] = "application/json; charset=utf-8";
        _mimeTypes[".svg"] = "image/svg+xml";
        _mimeTypes[".png"] = "image/png";
        _mimeTypes[".jpg"] = "image/jpeg";
        _mimeTypes[".jpeg"] = "image/jpeg";
        _mimeTypes[".webp"] = "image/webp";
        _mimeTypes[".mp4"] = "video/mp4";
        _mimeTypes[".woff"] = "font/woff";
        _mimeTypes[".woff2"] = "font/woff2";
        _mimeTypes[".ttf"] = "font/ttf";
        _mimeTypes[".txt"] = "text/plain; charset=utf-8";
    }

    public void Start()
    {
        _running = true;
        _listener.Start();
        Task.Run((Action)ListenLoop);
    }

    public void Stop()
    {
        _running = false;
        try { _listener.Stop(); } catch {}
    }

    private void ListenLoop()
    {
        while (_running)
        {
            try
            {
                var context = _listener.GetContext();
                Task.Run(() => ProcessRequest(context));
            }
            catch
            {
                if (!_running) break;
            }
        }
    }

    private void ProcessRequest(HttpListenerContext context)
    {
        var request = context.Request;
        var response = context.Response;

        try
        {
            string localPath = request.Url.LocalPath.TrimStart('/');
            if (string.IsNullOrWhiteSpace(localPath) || localPath == "/")
            {
                localPath = "index.html";
            }

            localPath = Uri.UnescapeDataString(localPath).Replace('/', Path.DirectorySeparatorChar);
            string filePath = Path.Combine(_root, localPath);

            if (!File.Exists(filePath))
            {
                response.StatusCode = 404;
                byte[] notFound = System.Text.Encoding.UTF8.GetBytes(string.Format("404 Not Found: {0}", localPath));
                response.OutputStream.Write(notFound, 0, notFound.Length);
                response.OutputStream.Close();
                return;
            }

            string ext = Path.GetExtension(filePath);
            string mime;
            if (!_mimeTypes.TryGetValue(ext, out mime))
            {
                mime = "application/octet-stream";
            }

            response.ContentType = mime;
            response.AddHeader("Access-Control-Allow-Origin", "*");
            response.AddHeader("Cache-Control", "no-cache");
            response.AddHeader("Accept-Ranges", "bytes");

            var fileInfo = new FileInfo(filePath);
            long totalLength = fileInfo.Length;
            string rangeHeader = request.Headers["Range"];

            bool isRange = false;
            long start = 0;
            long end = totalLength - 1;

            if (!string.IsNullOrEmpty(rangeHeader) && rangeHeader.StartsWith("bytes="))
            {
                string[] parts = rangeHeader.Substring(6).Split('-');
                if (parts.Length > 0 && !string.IsNullOrEmpty(parts[0]))
                {
                    long.TryParse(parts[0], out start);
                    isRange = true;
                }
                if (parts.Length > 1 && !string.IsNullOrEmpty(parts[1]))
                {
                    long.TryParse(parts[1], out end);
                    isRange = true;
                }
                else if (isRange && ext.Equals(".mp4", StringComparison.OrdinalIgnoreCase))
                {
                    // Open-ended range like "bytes=0-", cap chunk to 4MB for fast multiplexing
                    long maxChunk = 4 * 1024 * 1024 - 1;
                    end = Math.Min(totalLength - 1, start + maxChunk);
                }

                if (end >= totalLength) end = totalLength - 1;
                if (start < 0) start = 0;
            }

            if (request.HttpMethod == "HEAD")
            {
                if (isRange)
                {
                    long length = end - start + 1;
                    response.StatusCode = 206;
                    response.ContentLength64 = length;
                    response.AddHeader("Content-Range", string.Format("bytes {0}-{1}/{2}", start, end, totalLength));
                }
                else
                {
                    response.StatusCode = 200;
                    response.ContentLength64 = totalLength;
                }
            }
            else
            {
                using (var fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
                {
                    if (isRange)
                    {
                        long length = end - start + 1;
                        response.StatusCode = 206;
                        response.ContentLength64 = length;
                        response.AddHeader("Content-Range", string.Format("bytes {0}-{1}/{2}", start, end, totalLength));
                        fs.Seek(start, SeekOrigin.Begin);
                    }
                    else
                    {
                        response.StatusCode = 200;
                        response.ContentLength64 = totalLength;
                    }

                    byte[] buffer = new byte[65536];
                    long bytesRemaining = isRange ? (end - start + 1) : totalLength;
                    while (bytesRemaining > 0)
                    {
                        int toRead = (int)Math.Min(bytesRemaining, (long)buffer.Length);
                        int read = fs.Read(buffer, 0, toRead);
                        if (read <= 0) break;
                        response.OutputStream.Write(buffer, 0, read);
                        bytesRemaining -= read;
                    }
                }
            }
        }
        catch
        {
            // Ignore client resets/disconnects
        }
        finally
        {
            try { response.OutputStream.Close(); } catch {}
        }
    }
}
"@

if (-not ([System.Management.Automation.PSTypeName]'StreamingServer').Type) {
    Add-Type -TypeDefinition $csharpCode -Language CSharp
}

$root = (Get-Location).Path
$server = $null

try {
    $server = New-Object StreamingServer($Port, $root)
    $server.Start()
    Write-Host "PORTFOLIO_SERVER_RUNNING: http://localhost:$Port/"
} catch {
    $Port = 8081
    $server = New-Object StreamingServer($Port, $root)
    $server.Start()
    Write-Host "PORTFOLIO_SERVER_RUNNING: http://localhost:$Port/"
}

# Keep script process alive
while ($true) {
    Start-Sleep -Seconds 3600
}
