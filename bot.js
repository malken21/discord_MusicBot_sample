const { Client, Intents , MessageEmbed} = require("discord.js");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, 'GUILD_VOICE_STATES']});

const Config = require("./Config.json")
client.login(Config.TOKEN);
const ytdl = require('ytdl-core');
const search = require('yt-search');
const { entersState, AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel,  StreamType } = require('@discordjs/voice');

client.on('ready', () => {
	const data = [{
		name: "music",
		description: "YouTubeの音楽を再生",
		options: [{
			type: "STRING",
			name: "play",
			description: "動画のURLまたは検索したい音楽",
			required: true
		}]
	}];
	client.application.commands.set(data);
	console.log(`login!!(${client.user.tag})`);
});

client.on("interactionCreate", interaction => {
  if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === `music`) {
    const search_text = interaction.options.getString(`play`)
    search( search_text, function ( err, search_result ) {
      const url = search_result.videos[ 0 ].url

      const channel = interaction.member.voice.channel;
      if (!channel) {

        const music_embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`ボイスチャンネルに入ってから入力してください`)
        interaction.reply({ embeds: [music_embed]});

      }else{

        const music_embed = new MessageEmbed()
        .setColor('ffa500')
        .setTitle(`音楽bot`)
        .setDescription(`${url} を再生します`)
        interaction.reply({ embeds: [music_embed]});

        const connection = joinVoiceChannel({
          adapterCreator: channel.guild.voiceAdapterCreator,
          channelId: channel.id,
          guildId: channel.guild.id,
          selfDeaf: true,
          selfMute: false,
        });
        const player = createAudioPlayer();
        connection.subscribe(player);
        const stream = ytdl(ytdl.getURLVideoID(url), {
          filter: format => format.audioCodec === 'opus' && format.container === 'webm',
          quality: 'highest',
          highWaterMark: 32 * 1024 * 1024
        });
        const resource = createAudioResource(stream, {
          inputType: StreamType.WebmOpus
        });
        player.play(resource);
        entersState(player,AudioPlayerStatus.Playing, 10 * 1000);
        entersState(player,AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
      }
    })
  }
});