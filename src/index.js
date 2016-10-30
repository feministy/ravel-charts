const Papa = require('../node_modules/papaparse/papaparse.js')

const pullfiles = function () {
  let fileInput = document.querySelector("#csv")
  Papa.parse(fileInput.files[0], {
    complete: function(results) {
      console.log(results)
    },
    dynamicTyping: true,
    header: true
  })
}

document.querySelector("#csv").onchange = pullfiles

