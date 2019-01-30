const articleHed = document.querySelector('article header')
const articleLinks = document.querySelectorAll('article a[target="_blank"][title]')
// sometimes the first has weird properties
const articleClass = document.querySelectorAll('article p[class^=css]')[1].className

const outerDiv = document.createElement('div')
outerDiv.innerHTML = '<em>References</em><span class="loader"></span>'
outerDiv.className = `${articleClass} srclist-wrapper`

const sourceDiv = document.createElement('div')
sourceDiv.className = 'scitimes-srclist'

outerDiv.appendChild(sourceDiv);

articleLinks.forEach((anchor) => {
  chrome.runtime.sendMessage({
    method: 'GET',
    url: anchor.href
  }, (res) => {
    if (!res) return

    console.log('cb');

    // create div for each source
    const linkNode = document.createElement('a')
    linkNode.className = 'scitimes-source'
    linkNode.innerHTML = `${res.journal_title} <div class="src-title">${res.title}</div>`
    linkNode.href = res.url

    // Append to source list div
    sourceDiv.appendChild(linkNode)
  });


  // console.log(anchor.href);
})

// add source list to article
window.onload = () => {
  if (articleLinks) {
    articleHed.parentNode.insertBefore(outerDiv, articleHed.nextSibling)
  }
};
