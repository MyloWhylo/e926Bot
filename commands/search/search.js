const https = require('https')
const fs = require('fs');
const path = require('path')

const filename = path.join(__dirname, '..', '..', 'fileHistory.json');
let currentIters = require(filename);

const configFile = path.join(__dirname, '..', '..', 'config.json');
const { blacklist } = require(configFile);

const options = {
   hostname: 'e926.net',
   port: 443,
   method: 'GET',
   path: '',
   headers: { 'User-Agent': 'Discord Bot (@MyloWhylo#2095)' }
};

exports.getPosts = function (args) {
   return new Promise((resolve, reject) => {
      let searchTags = "";
      let blacklistTags = "";
      let len = args.length

      for (let ii = 0; ii < len; ii++) {
         if (ii) searchTags += "+";
         searchTags += args[ii];
      }

      len = blacklist.length
      for (let ii = 0; ii < len; ii++) {
         blacklistTags += "+-";
         blacklistTags += blacklist[ii];
      }

      options.path = "/posts.json?tags="
      options.path += searchTags;
      options.path += blacklistTags;
      options.path += "&limit=10";

      let data = "";

      var req = https.request(options, res => {

         res.on('data', d => {
            data += d;
         });

         res.on('end', error => {
            console.error(error);
            let retData = JSON.parse(data);
            resolve(retData);
         });
      });

      req.on('error', error => {
         reject(Error(error));
      });

      req.end();
   });
};

exports.selectPost = function (retData) {
   let post = undefined;
   for (let ii = 0; ii < retData.posts.length; ii++) {
      let currentID = String(retData.posts[ii].id);
      if (currentIters[currentID] != true) {
         post = retData.posts[ii];
         currentIters[currentID] = true;
         break;
      }
   }
   if (typeof post === 'undefined') {
      for (let ii = 0; ii < retData.posts.length; ii++) {
         let currentID = String(retData.posts[ii].id);
         delete currentIters[String(currentID)];
      }
      currentIters[retData.posts[0].id] = true;
      post = retData.posts[0];
   }

   fs.writeFileSync(filename, JSON.stringify(currentIters));
   return post;
};