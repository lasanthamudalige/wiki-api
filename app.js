const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/wikiDB");

// Create a model for the table
const articleSchema = mongoose.Schema({
    title: String,
    content: String
});

// Create a table using model
const Article = new mongoose.model("Article", articleSchema);

// Default articles to add when program run for the first time

const article1 = new Article(
    {
        "title": "REST",
        "content": "REST is short for REpresentational State Transfer. IIt's an architectural style for designing APIs."
    }
);

const article2 = new Article(
    {
        "title": "API",
        "content": "API stands for Application Programming Interface. It is a set of subroutine definitions, communication protocols, and tools for building software. In general terms, it is a set of clearly defined methods of communication among various components. A good API makes it easier to develop a computer program by providing all the building blocks, which are then put together by the programmer."
    }
);

const article3 = new Article(
    {

        "title": "Bootstrap",
        "content": "This is a framework developed by Twitter that contains pre-made front-end templates for web design"
    }
);

const article4 = new Article(
    {
        "title": "DOM",
        "content": "The Document Object Model is like an API for interacting with our HTML"
    }
);

const defaultArticles = [article1, article2, article3, article4];


///////////////////////////// Requests targeting all articles /////////////////////////////

app.route("/articles")
    // Serve up all the articles available
    .get(
        (req, res) => {
            Article.find({})
                // If article found
                .then((foundArticles) => {
                    // If returned array is not empty
                    if (foundArticles.length !== 0) {
                        console.log(foundArticles);
                        res.send(foundArticles);
                    } else {
                        // Add default items when the program run for the first time
                        Article.insertMany(defaultArticles)
                            .then((articles) => {
                                res.send(articles);
                            });
                    }
                })
                // If there are any errors send that error
                .catch((err) => {
                    res.send(err);
                });
        })
    // Get a new article
    .post((req, res) => {

        // Create a new article using that data and save
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        newArticle.save()
            .then(() => res.send("Successfully save the new article."))
            .catch((err) => res.send(err));
    })
    // Delete all the articles available
    .delete((req, res) => {

        Article.deleteMany()
            .then(() => res.send("Successfully deleted all the articles."))
            .catch((err) => res.send(err));

    });

///////////////////////////// Requests targeting a specific article /////////////////////////////

app.route("/articles/:articleTitle")
    // Get an article from the title
    .get(
        (req, res) => {
            // Get article name from url parameter
            Article.findOne({ title: req.params.article })
                .then((foundArticle) => {
                    if (foundArticle !== null) {
                        res.send(foundArticle);
                    } else {
                        res.send("No article matching the title was found.");
                    }
                })
                .catch((err) => {
                    res.send(err);
                });
        })
    // Change an article using title and update the title and the content
    .put(
        (req, res) => {
            Article.findOneAndUpdate({ title: req.params.articleTitle }, { title: req.body.title, content: req.body.content })
                .then((article) => {
                    if (article !== null) {
                        res.send("Successfully updated the selected article.");
                    } else {
                        res.send("Article was not found.");
                    }
                })
                .catch((err) => res.send(err));
        })
    // Change an article using title whatever parameter user sent 
    .patch((req, res) => {
        Article.findOneAndUpdate({ title: req.params.articleTitle }, { $set: req.body }) // update only the send keys
            .then((article) => {
                if (article !== null) {
                    res.send("Successfully updated the selected article.");
                } else {
                    res.send("Article not found.");
                }
            })
            .catch((err) => res.send(err));
    })
    // Delete selected article
    .delete((req, res) => {
        Article.deleteOne({ title: req.params.articleTitle })
            .then((article) => {
                if (article !== null) {
                    res.send("Successfully deleted the corresponding article.")
                } else {
                    res.send("Article not found.")
                }
            })
            .catch((err) => res.send(err));
    });


app.listen(3000, function () {
    console.log("Server started on port 3000");
});