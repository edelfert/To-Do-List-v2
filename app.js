//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const dishes = new Item ({
  name: "Do Dishes"
})

const laundry = new Item ({
  name: "Do Laundry"
})

const code = new Item ({
  name: "Practice Coding"
})

const defaultItems = [dishes, laundry, code];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0 ) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err)
        } else {
          console.log("Success!")
        }
      })

      res.redirect('/');
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }


  });



});


app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name: customListName}, function (err, foundList){
    if (!err) {
      if (!foundList){
        //Create new list
        const list = new List ({

          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName)
      } else {
        //sow existing list
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items})
        }
    }

  })



})

app.post("/", function(req, res){

const itemName = req.body.newItem;

const item = new Item ({
  name: itemName
})

item.save();

res.redirect("/")


});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err){
    if (err) {
      console.log("error");

    } else {
      console.log("success!");
      res.redirect("/")
    }
  })
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
