// Require the necessary discord.js classes
const { Client, Intents, MessageEmbed } = require('discord.js');
const { token, images } = require('./config.json');
const e9Search = require('./commands/search/search.js');
const Log = require('./utils/logging.js');

const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"] });

// When the client is ready, run this code (only once)
// Login to Discord with your client's token
client.login(token);

client.once('ready', () => {
   console.log('Ready!');
   Log.begin();
   client.user.setActivity('My prefix is ?', { type: "PLAYING" });
});

client.on("messageCreate", (message) => {
   if (message.content.slice(0, 1) != "?") return;
   if (message.author.bot) return;

   let args = message.content.split(" ");

   command = args.shift();

   if (command === "?help") {
      message.reply("`?search: searches for whatever tags you want.`");
   }
   if (command === "?avali") {
      message.channel.send(images.avali);
   }
   if (command === "?search") {
      e9Search.getPosts(args).then(retData => {
         if (retData.posts.length < 1) {
            message.reply("Your search returned no results. Please try again.");
         }

         else {
            let post = e9Search.selectPost(retData);
            let artistList = post.tags.artist;
            let artists = "";

            let dnpFlag = artistList.indexOf("conditional_dnp");
            if (dnpFlag > -1) artistList.splice(dnpFlag, 1);

            for (let ii = 0; ii < artistList.length; ii++) {
               if (ii) artists += ", ";

               if (artistList[ii].includes("_(artist)")) {
                  artists += artistList[ii].substring(0, artistList[ii].length - 9);
               }
               else artists += artistList[ii];
            }

            const wholesomeEmbed = new MessageEmbed()
               .setColor('#990000')
               .setTitle('Search Results')
               .setURL(`https://e926.net/posts/${post.id}`)
               .setAuthor('E926Bot', images.botPFP, images.botPFP)
               .setDescription(`${artistList.length > 1 ? "Artists:" : "Artist:"} ${artists}`)
               .setImage(post.file.url)
               .setTimestamp()
               .setFooter('E926Bot', images.botPFP);

            message.channel.send({ embeds: [wholesomeEmbed] });

            Log.addEntry("ImageRequest", { args: args, message: message, sentImage: post });
         }
      });
   }
});

client.on('messageReactionAdd', async (reaction, user) => {
   console.log("got request")
   if (reaction.emoji.name === '❌') {
      if (!user.bot) {
         if (reaction.message.author.id = client.user.id) {
            reaction.message.delete();
            Log.addEntry("DeleteMessageRequest", { requestUser: user.id, message: reaction.message });
         }
      }
   }
});