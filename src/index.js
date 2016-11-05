const Papa = require('../node_modules/papaparse/papaparse.js')

let patterns = []
let promotions = []

const createChart = () => {
  let svg = d3.select('svg')
  let margin = { top: 20, right: 20, bottom: 30, left: 40 }
  let width = +svg.attr('width') - margin.left - margin.right
  let height = +svg.attr('height') - margin.top - margin.bottom

  let x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
  let y = d3.scaleLinear().rangeRound([height, 0])

  d3.select('svg').selectAll('rect').data(patterns).enter().append('rect')
    .attr('height', function (d) { return d.salesTotal() + 20 })
    .attr('x', function (d, i) {
      return i * (width / patterns.length)
    })
    .attr('y', function (d) {
      return height - d.salesTotal() + 20
    })
    .attr('width', 20)
    // .text(function(d) { return d.name; });

  svg.selectAll('text')
    .data(patterns)
    .enter()
    .append('text')
    .attr('x', function(d, i) {
      return i * (width / patterns.length) + 10
     })
    .attr('y', function(d) {
      return height - d.salesTotal() + 35
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '11px')
    .attr('fill', 'white')
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.salesTotal()
    })
}

const pullfiles = () => {
  let fileInput = document.querySelector('#csv')

  Papa.parse(fileInput.files[0], {
    complete: (results) => {
      results.data.forEach(row => {
        let promotion = row.Product.split(':').includes('Promotion')
        if (!promotion) {
          let pattern = new Pattern(row)
          patterns.push(pattern)
        }
      })
      createChart()
    },
    dynamicTyping: true,
    header: true
  })
}

document.querySelector('#csv').onchange = pullfiles

class Pattern {
  constructor (row) {
    this.name = row.Product

    // remove product name to have just sales & units
    delete row.Product
    this.data = row

    let keys = Object.keys(this.data)
    let splitKeys = keys.map(key => key.split(' '))
    let salesKeys = splitKeys.filter(keyArray => keyArray.includes('Sales'))
    let unitKeys = splitKeys.filter(keyArray => keyArray.includes('Units'))

    this.sales = {}
    this.units = {}

    salesKeys.forEach(keyArray => {
      let storageKey = keyArray[0] + ' ' + keyArray[1]
      let lookupKey = storageKey + ' ' + 'Sales'
      this.sales[storageKey] = this.data[lookupKey] 
    })

    unitKeys.forEach(keyArray => {
      let storageKey = keyArray[0] + ' ' + keyArray[1]
      let lookupKey = storageKey + ' ' + 'Units'
      this.units[storageKey] = this.data[lookupKey] 
    })
  }

  salesTotal () {
    return this.calculateTotal(this.sales)
  }

  unitsTotal () {
    return this.calculateTotal(this.units)
  }

  calculateTotal (salesOrUnits) {
    let total = 0
    Object.keys(salesOrUnits).forEach(key => {
      if (salesOrUnits[key] > 0) {
        total += salesOrUnits[key]
      }
    })
    return total
  }
}

