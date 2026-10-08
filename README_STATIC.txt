AYUSH PORTFOLIO V65 — INDEX-ONLY CAROUSEL DATA

MAIN PAGE
- Edit index.html.
- Search for: FEATURED CAROUSEL DATA
- Each featured project keeps its text, link, image/video and tags inside one <article class="project-card">.
- The carousel no longer loads project text from js/project-data.js or an inline JavaScript data array.

EDIT A FEATURED PROJECT
Change these attributes in its <article>:
- data-title
- data-subtitle
- data-role
- data-year
- data-description
- data-tags (comma separated)
- data-categories (comma separated)
- data-link
- data-image (thumbnail used by the Works grid when the carousel uses video)

LOCAL VIDEO
Put your MP4 in:
assets/videos/projects/

Then replace the project's <img> with:
<video
  class="project-video"
  src="assets/videos/projects/your-video.mp4"
  autoplay
  muted
  loop
  playsinline
  preload="metadata"
></video>

The video src is read automatically from the <video> tag.

YOUTUBE
Replace the <img> with the existing .youtube-video-wrap iframe structure.
The iframe src is read from the same project article.

ALL WORKS GRID
- Featured project data comes from the five carousel articles.
- Non-featured project data is also in index.html.
- Search for: WORKS GRID DATA

SEPARATE PROJECT PAGES
Edit each page independently:
projects/roar.html
projects/bounty-hunter-royal.html
projects/red-bamboo.html
projects/happy-now-2.html
projects/soul-eater.html
...and the remaining files in projects/.

MEDIA PATHS INSIDE PROJECT PAGES
Because those pages are one folder deeper, use:
../assets/images/projects/file.jpg
../assets/videos/projects/file.mp4

No browser storage, runtime editor, projects.json, or project-data.js is used.
