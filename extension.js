const blacklistRegex = /facebook|fb\.me|twitter|(nyt)(i\.?me?s)?|instagram/g
const articleHed = document.querySelector('article header')
const articleLinks = document.querySelectorAll('article a[target="_blank"][title]')

const outerDiv = document.createElement('details')
outerDiv.className = 'srclist-wrapper'
outerDiv.innerHTML = '<summary></span><span id="src-count"></span>References</summary>'
articleHed.append(outerDiv);

const sourceDiv = document.createElement('div')
sourceDiv.className = 'scitimes-srclist'

outerDiv.appendChild(sourceDiv);

articleLinks.forEach((anchor) => {
  if (anchor.href.match(blacklistRegex)) return // skip social media, etc

  chrome.runtime.sendMessage({
    method: 'GET',
    url: anchor.href
  }, (res) => {
    if (!res) return
    // destructure properties
    const {journal_title, title, url} = res
    // create div for each source
    const linkNode = document.createElement('a')
    linkNode.className = 'scitimes-source'
    linkNode.innerHTML = `${journal_title}<div class="src-title">${title}</div>`
    linkNode.href = url

    // Append to source list div
    sourceDiv.appendChild(linkNode)
    document.getElementById('src-count').innerHTML = `${sourceDiv.children.length} `
  })
})

// add source list to article
// window.onload = () => {
//   if (articleLinks) {
//     articleHed.parentNode.insertBefore(outerDiv, articleHed.nextSibling)
//   }
// };
