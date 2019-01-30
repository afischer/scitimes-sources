function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}

function getJournalProp(head, query) {
  // shakes fist at javascript
  const prop = head.querySelector(`meta[name='citation_${query}']`)
               || head.querySelector(`meta[name='dc.${query}']`)
               || head.querySelector(`meta[name='dc.${titleCase(Query)}']`)
               || head.querySelector(`meta[name='dc.publisher']`)
  if (!prop) return;
  return prop.content
}

chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  console.log('GOT MESSAGE WITH URL ', request.url);
  const citeProps = ['title']
  const metaProps = {url: request.url}

  const xhr = new XMLHttpRequest();

  xhr.onload = function() {
    console.log('Requesting', request.url)
    const headElt = this.responseXML.head

    // get journal title, requires a few checks
    metaProps['journal_title'] = headElt.querySelector(`meta[name='citation_journal_title']`) ||
                                 headElt.querySelector(`meta[name='dc.source']`) ||
                                 headElt.querySelector(`meta[name='dc.Source']`) ||
                                 headElt.querySelector(`meta[name='dc.publisher']`)

    if (!metaProps['journal_title']) {
      // TODO: Deal with horrible DOI javascript redirects
      const nextURL = this.responseXML.body.querySelector('[name="redirectURL"]').value
      console.warn('No journal! Trying with', decodeURIComponent(nextURL))
      console.warn(this.responseXML)
      xhr.open(request.method, decodeURIComponent(nextURL))
      return xhr.send()
    }

    metaProps['journal_title'] = metaProps['journal_title'].content

    // get other props
    citeProps.forEach((prop) => metaProps[prop] = getJournalProp(headElt, prop))

    console.log('Found properties', metaProps)
    callback(metaProps)
  }

  xhr.open(request.method, request.url)
  xhr.responseType = "document";
  xhr.send();

  return true;
});
