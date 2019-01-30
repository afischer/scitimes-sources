function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  const citeProps = ['title']
  const metaProps = {url: request.url}

  const xhr = new XMLHttpRequest();

  xhr.onload = function() {
    console.log('Requesting', request.url)
    const headElt = this.responseXML.head

    // get journal title

    // shakes fist at javascript
    metaProps['journal_title'] = headElt.querySelector(`meta[name='citation_journal_title']`) ||
                                 headElt.querySelector(`meta[name='dc.source']`) ||
                                 headElt.querySelector(`meta[name='dc.Source']`) ||
                                 headElt.querySelector(`meta[name='dc.publisher']`)

    if (!metaProps['journal_title']) {
      // TODO: Deal with horrible DOI javascript redirects
      const nextURL = this.responseXML.body.querySelector('[name="redirectURL"]').value
      console.warn('I think I need', decodeURI(nextURL))

      console.warn('No Journal found!')
      console.warn(this.responseXML)
      console.warn('-------')
      return
    }

    metaProps['journal_title'] = metaProps['journal_title'].content




    // get other props
    citeProps.forEach((prop) => {
      metaProps[prop] = headElt.querySelector(`meta[name='citation_${prop}']`) ||
                        headElt.querySelector(`meta[name='dc.${prop}']`) ||
                        headElt.querySelector(`meta[name='dc.${titleCase(prop)}']`)

      metaProps[prop] = metaProps[prop].content
    })

    console.log(metaProps);
    // callback(this.responseXML.head);
    callback(metaProps)
  }

  xhr.open(request.method, request.url);
  xhr.responseType = "document";
  xhr.send();

  // console.log(request);
  // Http.open(request.method, request.url);
  // Http.responseType = 'document'
  // Http.send();
  // Http.onreadystatechange= (response) =>{
  //   console.log(Http.responseXML);
  //   if (Http.responseXML && Http.readyState==4 && Http.status==200) {
  //     callback(Http.responseXML)
  //   }
  // }

  return true;
});
