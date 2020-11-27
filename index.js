const Discord    = require("discord.js");
const config     = require("./config/config.json");
const fs         = require('fs');
var mysql        = require('mysql');
var usersNow     = new Map();
const client     = new Discord.Client();
process.env.TZ = 'Europe/Ulyanovsk' ;
//Europe/Ulyanovsk
var mysqlconne = mysql.createConnection({
  host     : 'localhost',
  user     : 'teyhd',
  password : '258000',
  database : 'discord'
});
  mysqlconne.connect();
//function ds(){

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(client.uptime);
  client.user.setActivity('за вами', { type: 'WATCHING' });
  fake_connect();
 // record('779362056411414579','531959063693754368');
// setTimeout(function() {recI.end()}, 5000);
 // console.log(reciv);
   //var playing = play("779362056411414579","user_auo");
   // console.log(Discord.VoiceReceiver.createStream(531959063693754368));
});

client.on('message', msg => {
    switch (msg.content) {
        case 'ping':
            const timeTaken = Date.now() - msg.createdTimestamp;
            msg.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            break;
        case 'uptime':
            msg.reply(`Uptime: ${client.uptime}`);
            break;       
        case 'conn':
            fake_connect();
            msg.reply(`Ready`);
            break;
        case 'help':
            msg.reply(`ping,uptime,conn`);
            break;
    }

});

client.on('voiceStateUpdate', info => {
      for (let user of info.guild.voiceStates.cache.keys()){
          
          let userName='';
          try {
          if(info.guild.voiceStates.cache.get(user).member.nickname!=null) userName=info.guild.voiceStates.cache.get(user).member.nickname
            else userName = info.guild.voiceStates.cache.get(user).member.user.username;
          } catch (e) {
                 userName = info.guild.voiceStates.cache.get(user).member.user.username;
            }

            if (!usersNow.has(user)){
                let chann = info.guild.voiceStates.cache.get(user).channelID;
                let userinfo = {
                  channel:chann,
                  name: userName,
                  group: info.guild.voiceStates.guild.channels.cache.get(chann).name,
                  time: get_current_time()
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

client.login(config.BOT_TOKEN); 
//}
function fake_connect(){
        client.channels.fetch('779362056411414579')
      .then(channel => {
         // console.log(channel.guild.voiceStates);
          channel.join();
            setTimeout(function() {channel.leave();}, 5000);
      })
      .catch(console.error);
}
function new_user(user,userinfo){
  usersNow.set(user,userinfo); 
  //add_user(user,userinfo.name);
  console.log(`Вошел новый пользователь: ${userinfo.name}`);
}
function user_exit(user){
    console.log(`${usersNow.get(user).name} вышел`);
    add_mysql(user);
    usersNow.delete(user);
}
function user_chg_chan(ChanInfo){
    console.log(`${usersNow.get(ChanInfo.userId).name} сменил канал [${usersNow.get(ChanInfo.userId).group}] => [${ChanInfo.name}]`);
    add_mysql(ChanInfo.userId);
    usersNow.get(ChanInfo.userId).channel = ChanInfo.id;
    usersNow.get(ChanInfo.userId).group = ChanInfo.name;
    usersNow.get(ChanInfo.userId).time =get_current_time();
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
         // console.log(channel.guild.voiceStates);
          channel.join()
          .then(connection => {
                 var recI = connection.receiver.createStream(user_id,{mode:'pcm',end:'manual'});
                 recI.pipe(fs.createWriteStream('voc'));
                  })
          .catch(console.error);
      })
      .catch(console.error);
}
function get_current_time(){
    return `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
}
//mysql
function add_user(id,name){  
    let quer = `(${id}, '${name}');`;
    try {
      mysqlconne.query("INSERT `users` (`user_id`, `name`) VALUES "+quer, function (error, results, fields) {
      if (error==null) return(results.affectedRows);
      //return results[0];
      console.log(error);
    });     
    } catch (e) {console.log(e.error)}
}
function add_mysql(user){
    let quer = `(${user}, '${usersNow.get(user).name}', '${usersNow.get(user).group}','${usersNow.get(user).time}' ,'${get_current_time()}');`;
    try {
      mysqlconne.query("INSERT `attendance` (`user_id`, `name`, `group`, `time_start`, `time_stop`) VALUES "+quer, function (error, results, fields) {
      if (error==null) return(results.affectedRows);
      //return results[0];
      console.log(error);
    });     
    } catch (e) {console.log(e.error)}    
}

process.on('uncaughtException', (err) => {
    //ans("Пойман глобальный косяк при попытки к бегству!!! Не беспокойтесь!!!!");
  console.log('whoops! there was an error', err.stack);
}); //Если все пошло по пизде, спасет ситуацию