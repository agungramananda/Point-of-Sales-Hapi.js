const start_date = new Date();
const duration = 365;
const end_date = new Date();
end_date.setDate(start_date.getDate() + duration);

console.log(end_date);
console.log(start_date);
