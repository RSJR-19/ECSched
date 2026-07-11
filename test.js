console.log(Date.parse('6 19, 2007 10:25:00') === Date.parse('June 19, 2007 10:25'))

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const hour = date.getHours();
const minutes = date.getMinutes();

console.log(Date.parse(`${month} ${day}, ${year} ${hour}:${minutes}`));

a = Date.parse('6 19, 2007 13:01')
b = Date.parse('6 19, 2007 01:01 PM')

console.log(a,b)