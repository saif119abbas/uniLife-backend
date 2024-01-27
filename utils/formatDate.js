exports.formatDate = (inputDay) => {
  const today = new Date();
  const yesterday = new Date(today);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  yesterday.setDate(yesterday.getDate() - 1);
  let date = "";
  if (
    today.getFullYear() === inputDay.getFullYear() &&
    today.getMonth() === inputDay.getMonth() &&
    today.getDate() === inputDay.getDate()
  )
    date = `today ${inputDay.getHours()}:${inputDay
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  else if (
    yesterday.getFullYear() === inputDay.getFullYear() &&
    yesterday.getMonth() === inputDay.getMonth() &&
    yesterday.getDate() === inputDay.getDate()
  )
    date = `yesterday ${inputDay.getHours()}:${inputDay
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  else {
    date = `${inputDay.getDate()}\/${
      months[inputDay.getMonth()]
    }\/${inputDay.getFullYear()} ${inputDay.getHours()}:${inputDay
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  return date;
};

exports.localFormatter = (date) => {
  console.log(date);
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const myDate = date.toLocaleDateString(undefined, options);
  console.log(myDate);
  return myDate;
};
