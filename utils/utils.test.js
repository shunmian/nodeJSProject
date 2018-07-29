const expect = require('expect')
const utils = require('./utils')


it('should return 3 for add 1 and 2', ()=>{
  const res = utils.add(1,2)
  expect(res).toBe(3)
})

it('should return 7 for add 3 and 4 for aysnc add', (done)=>{
  utils.asyncAdd(3, 4, (res)=>{
    expect(res).toBe(7)
    done()
  })
})