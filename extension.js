const blacklistRegex = /facebook|fb\.me|wikipedia|twitter|(nyt)(i\.?me?s)?|instagram/g
const articleHed = document.querySelector('article header')
let articleLinks = document.querySelectorAll('article a[target="_blank"][title]')
articleLinks = [...articleLinks].map(elt => elt.href).filter(url => !url.match(blacklistRegex));

const outerDiv = document.createElement('details')
outerDiv.className = 'srclist-wrapper'
outerDiv.innerHTML = '<summary></span><span id="src-count" class="scitimes-loader"></span>References</summary>'
articleHed.append(outerDiv);

const sourceDiv = document.createElement('div')
const srcCount = document.getElementById('src-count')
sourceDiv.className = 'scitimes-srclist'

outerDiv.appendChild(sourceDiv);

console.log('links', articleLinks);

chrome.runtime.sendMessage({
  method: 'GET',
  urls: articleLinks
}, (res) => {
  if (!res) return

  // set length div
  srcCount.classList = ['srclist-number']
  srcCount.innerHTML = `${res.length}`

  res.forEach(articleData => {
    // destructure properties
    const {journal_title, title, url} = articleData
    // create div for each source
    const linkNode = document.createElement('a')
    linkNode.className = 'scitimes-source'
    linkNode.innerHTML = `${journal_title}<div class="src-title">${title}</div>`
    linkNode.href = url

    // Append to source list div
    sourceDiv.appendChild(linkNode)
  })
})
