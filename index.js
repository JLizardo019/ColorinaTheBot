console.log("hello bot");

const dotenv = require("dotenv").config();
var fs = require('fs');
// var folder = require("/images");
var data;
var request = require('request');
var bodyParser = require('body-parser');
var TwitterPackage = require('twitter');

var secret = {
  consumer_key: process.env.APIKEY,
  consumer_secret: process.env.SECRET,
  access_token_key: process.env.ACCESS,
  access_token_secret: process.env.ACCESS_SECRET
}
var Twitter = new TwitterPackage(secret);

// start server
const express=require("express"); 
const app = express();
app.use(express.static(__dirname+'/public')); // creating a static server and serving public number
app.use(express.json({extended:true, limit: '50mb'}));
app.use(express.urlencoded({extended:true,limit: '50mb'}));
app.use(express.json());
var num = 1;
var ready = false;
var name = "";


// reference for this code: https://chatbotslife.com/how-to-make-a-twitter-bot-841b20655328
// and npm documentation for 'twitter'

// Call the stream function and pass in 'statuses/filter', our filter object, and our callback
Twitter.stream('statuses/filter', {track: '#ColorizeThisPlz'}, function(stream) {

  // ... when we get tweet data...
  stream.on('data', function(tweet) {
    // num+=1;
    ready=true;

    // print out the text of the tweet that came in
    console.log("1 Incoming tweet \n:", tweet.text);
    name = tweet.user.screen_name;
    
    
    download(tweet.extended_entities.media[0].media_url, __dirname +`/public/images/input/input${num}.png`, function(){
        console.log('2 done downloading');
      });

  });

  // ... when we get an error...
  stream.on('error', function(error) {
    //print out the error
    console.log(error);
  });
});

// reference: https://stackoverflow.com/questions/12740659/downloading-images-with-node-js
function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
    //   console.log('content-type:', res.headers['content-type']);
    //   console.log('content-length:', res.headers['content-length']);
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  };

function postTweet(){
  console.log("data", data);
  // Make post request on media endpoint. Pass file data as media parameter
  Twitter.post('media/upload', {media: data}, function(error, media, response) {

    if (!error) {
  

      // Lets tweet it
      var status = {
        // @" + tweet.user.screen_name + "
        status: "Hi @" + name + ", Here is your custom image.",
        media_ids: media.media_id_string // Pass the media id string
      }
  
      Twitter.post('statuses/update', status, function(error, tweet, response) {
        if (!error) {
          console.log("4 Successfully replied!"); // tweet
        }
        console.log(error);
      });
  
    }
    else{
      console.log(error);
    }
  });
}


// endpoints
app.get("/status",(req,res) =>{
  console.log("requesting status");
  res.json({"status": ready});
})

app.get("/input",(req,res) =>{
  console.log("sending image");
  res.json({"file":`./images/input/input${num}.png`});
  ready=false;
})

app.post("/output", (req,res)=>
{
    let data2 = req.body;
    // console.log("base64", data2);
    data2 = data2.imageData.replace("data:image/png;base64,","");
    let buff = new Buffer.from(data2, 'base64');
    fs.writeFileSync('./images/output/output1.png', buff);
    console.log("recieved output");
    data = fs.readFileSync("./images/output/output1.png");;
    postTweet();
    res.json({complete: true});
})

app.listen(3000, ()=> {
  console.log("listening on port localhost:3000");
});