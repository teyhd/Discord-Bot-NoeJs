const Discord    = require("discord.js");
const config     = require("./config/config.json");
const bdconf     = require("./config/bd.json");
const fs         = require('fs');
var mysql        = require('mysql');
var usersNow     = new Map();
const client     = new Discord.Client();
var mysqlconne = mysql.createConnection(bdconf);
process.env.TZ = 'Europe/Ulyanovsk' ;

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
    let is_answered = false;
    switch (msg.content) {
        case 'ping':
            const timeTaken = Date.now() - msg.createdTimestamp;
            msg.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
            is_answered = true;
            break;
        case 'uptime':
            msg.reply(`Uptime: ${client.uptime}`);
              is_answered = true;
            break;       
        case 'conn':
            fake_connect();
            msg.reply(`Ready`);
              is_answered = true;
            break;
        case 'help':
            msg.reply(`ping,uptime,conn`);
              is_answered = true;
            break;
        case 'clear':
            delete_messages(msg);
            break;
    }
    if(is_answered){
       msg.delete().catch(); 
    }

});

client.on('voiceStateUpdate', info => {
      for (let user of info.guild.voiceStates.cache.keys()){
          let chann,chan_name;
          let userName='';
          try {
            chann = info.guild.voiceStates.cache.get(user).channelID;
            chan_name = info.guild.voiceStates.guild.channels.cache.get(chann).name;
 
          } catch (e) {
                 console.log('err');
            }
            
            try {
                if(info.guild.voiceStates.cache.get(user).member.nickname!=null) userName=info.guild.voiceStates.cache.get(user).member.nickname
                else userName = info.guild.voiceStates.cache.get(user).member.user.username;
            } catch (e) {
                userName = info.guild.voiceStates.cache.get(user).member.user.username;
            }

            if (!usersNow.has(user)){

                let userinfo = {
                  channel:chann,
                  name: userName,
                  group: chan_name,
                  time: get_current_time(),
                  date: get_cur_date()
              }
                  new_user(user,userinfo);           
            } else {
                if(usersNow.get(user).channel!=info.guild.voiceStates.cache.get(user).channelID){
                    if(info.guild.voiceStates.cache.get(user).channelID==null){
                        user_exit(user);//Вышел
                    } else {

                        let newCH = {
                            userId: user,
                            id: chann,
                            name:chan_name
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
  console.log(`Вошел новый пользователь: ${userinfo.name} в канал ${userinfo.group}`);
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
    usersNow.get(ChanInfo.userId).date = get_cur_date();
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
function get_cur_date(){
    let mon = new Date().getMonth()+1;
    let dayn = new Date().getDate();
    mon = (mon < 10) ? '0' + mon : mon;
    dayn = (dayn < 10) ? '0' + dayn : dayn;
    return `${new Date().getFullYear()}-${mon}-${dayn}`;
}
async function delete_messages(mess) { // Объявление асинхронной функции
    await mess.channel.messages.fetch({
        limit: 5
    }).then(messages => {
        mess.channel.bulkDelete(messages)
        //mess.channel.send(`Удалено ${amount} сообщений!`)
    })
};
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
    let quer = `(${user},'${usersNow.get(user).name}','${usersNow.get(user).group}','${usersNow.get(user).time}','${get_current_time()}','${usersNow.get(user).date}');`;
    try {
      mysqlconne.query("INSERT `attendance` (`user_id`, `name`, `group`, `time_start`, `time_stop`,`date`) VALUES "+quer, function (error, results, fields) {
      if (error==null) return(results.affectedRows);
      //return results[0];
      console.log(error);
    });     
    } catch (e) {
        console.log(e.error)
        mysqlconne.end();
        mysqlconne.connect();
    }    
}

process.on('uncaughtException', (err) => {
    client.destroy();
    mysqlconne.destroy();
    mysqlconne = mysql.createConnection(bdconf);
    mysqlconne.connect();
    client.login(config.BOT_TOKEN); 
  console.log('whoops! there was an error', err.stack);
}); //Если все пошло по пизде, спасет ситуацию