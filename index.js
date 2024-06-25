const erenaydb = require("./erenaydb");

erenaydb.setAdapter("rethink", {
  host: "localhost",
  port: 28015,
  db: "HarenUptime",
});

erenaydb.setCheckUpdates()
setTimeout(async () => {
  await erenaydb.add("y", 1);
  await erenaydb.add("z", 3);
  await erenaydb.all().then(async(result) => {
    console.log(result);
  });
}, 2000);
