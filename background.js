function titleCase(str) {
  str = str.toLowerCase().split(' ')
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1)
  }
  return str.join(' ')
}

function getJournalProp(head, query) {
  // shakes fist at javascript
  const prop = head.querySelector(`meta[name='citation_${query}']`)
               || head.querySelector(`meta[name='dc.${query}']`)
               || head.querySelector(`meta[name='dc.${titleCase(Query)}']`)
               || head.querySelector(`meta[name='dc.publisher']`)
  if (!prop) return
  return prop.content
}

const getArticleProps = url => {
  return new Promise((resolve, reject) => {
    const method = 'GET';

    const citeProps = ['title']
    const metaProps = {url: url}

    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    xhr.responseType = "document"

    xhr.onload = function() {
      console.log('Requesting', url)
      const headElt = this.responseXML.head

      // get journal title, requires a few checks
      metaProps['journal_title'] = headElt.querySelector(`meta[name='citation_journal_title']`) ||
                                   headElt.querySelector(`meta[name='dc.source']`) ||
                                   headElt.querySelector(`meta[name='dc.Source']`) ||
                                   headElt.querySelector(`meta[name='dc.publisher']`)

      if (!metaProps['journal_title']) {
        // TODO: better deal with horrible DOI javascript redirects
        const redirectURL = this.responseXML.body.querySelector('[name="redirectURL"]')
        const nextURL = redirectURL && redirectURL.value !== null && decodeURIComponent(redirectURL.value)
        if (!nextURL) return resolve(); // nothing to do
        console.warn('No journal! Trying with', nextURL)
        console.warn(this.responseXML)
        xhr.open(method, decodeURIComponent(nextURL))
        return xhr.send()
      }

      metaProps['journal_title'] = metaProps['journal_title'].content

      // get other props
      citeProps.forEach((prop) => metaProps[prop] = getJournalProp(headElt, prop))

      console.log('Found properties', metaProps)
      resolve(metaProps)
    };

    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };

    xhr.send()
  });
}

function getAllArticleData(articleDataProms, cb) {
  return Promise.all(articleDataProms).then(articleData => {
    cb(articleData.filter(data => data != null))
  }).catch(err => console.err('Got an error', err))
}

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  console.log('GOT MESSAGE WITH URLs ', request.urls)
  const { urls } = request;
  const articleDataProms = urls.map(url => getArticleProps(url))
  console.log('data proms', articleDataProms);
  getAllArticleData(articleDataProms, callback)
  return true; // async
})
