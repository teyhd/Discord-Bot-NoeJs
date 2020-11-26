const Discord = require("discord.js");
const config = require("./config.json");
const fs = require('fs');
const client = new Discord.Client();
var usersNow = new Map();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('за вами', { type: 'WATCHING' })
  var reciv = record('779362056411414579','531959063693754368');
  //var playing = play("779362056411414579","user_auo");
  //console.log(Discord.VoiceReceiver.createStream(531959063693754368));
});
client.on('message', msg => {
    switch (msg.content) {
        case 'ping':
            const timeTaken = Date.now() - msg.createdTimestamp;
            msg.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            break;
    }
});
client.on('voiceStateUpdate', info => {
      for (let user of info.guild.voiceStates.cache.keys()){
          let userName='';
          if(info.guild.voiceStates.cache.get(user).member.nickname!=null) userName=info.guild.voiceStates.cache.get(user).member.nickname
            else userName = info.guild.voiceStates.cache.get(user).member.user.username;
            
            if (!usersNow.has(user)){
                let chann = info.guild.voiceStates.cache.get(user).channelID;
                let userinfo = {
                  channel:chann,
                  name: userName,
                  group: info.guild.voiceStates.guild.channels.cache.get(chann).name,
                  time: new Date()
              }
                  new_user(user,userinfo);           
            } else {
                if(usersNow.get(user).channel!=info.guild.voiceStates.cache.get(user).channelID){
                    if(info.guild.voiceStates.cache.get(user).channelID==null){
                        user_exit(user);//Вышел
                    } else {
                        let newChId = info.guild.voiceStates.cache.get(user).channelID;
                        let newCH = {
                            userId: user,
                            id: newChId,
                            name: info.guild.voiceStates.guild.channels.cache.get(newChId).name
                        }
                       user_chg_chan(newCH);//перешел
                    }
                }
            }
      }
    //console.log(usersNow);
    //console.log("\n");
});
function new_user(user,userinfo){
  usersNow.set(user,userinfo); 
  console.log(`Вошел новый пользователь: ${userinfo.name}`);
}
function user_exit(user){
    console.log(`${usersNow.get(user).name} вышел`);
    usersNow.delete(user);
}
function user_chg_chan(ChanInfo){
    console.log(`${usersNow.get(ChanInfo.userId).name} сменил канал [${usersNow.get(ChanInfo.userId).group}] => [${ChanInfo.name}]`);
    usersNow.get(ChanInfo.userId).channel = ChanInfo.id;
    usersNow.get(ChanInfo.userId).group = ChanInfo.name;
}
function play(voiceChan,filename){
     client.channels.fetch(`${voiceChan}`)
      .then(channel => {
          channel.join()
          .then(connection => {
              return connection.play(`/var/www/html/discord/${filename}`)
                  })
          .catch(console.error);
      })
      .catch(console.error);
}
function sendMsg(chan,msg){
      client.channels.fetch(`${chan}`)
      .then(channel => channel.send(msg) )
      .catch(console.error);
}
function record(chan_id,user_id){
           client.channels.fetch(chan_id)
      .then(channel => {
          console.log(channel.guild.voiceStates);
          channel.join()
          .then(connection => {
           return connection.receiver.createStream(user_id,{mode:'pcm',end:'manual'}).pipe(fs.createWriteStream('user_auo'));
                  })
          .catch(console.error);
      })
      .catch(console.error);
}
client.login(config.BOT_TOKEN);