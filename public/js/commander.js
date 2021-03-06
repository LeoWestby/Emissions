var missionStarted = false;

window.onload = function() {
	var socket = io.connect();
	var id = "commander";
	var happyVideoUrl = "http://video.webmfiles.org/big-buck-bunny_trailer.webm";
	var nervousVideoUrl = "http://video.webmfiles.org/elephants-dream.webm";
	
	//Changes the url of the astronaut video
	var changeLocalVideo = function(videoUrl) {
		$("#astronautVideo source").attr("src", videoUrl);
		$("#astronautVideo")[0].load();	
	};
	
	//Changes the url of the astronaut video for every client watching it
	var changeVideo = function(videoUrl) {
		socket.emit("change video", videoUrl);
		changeLocalVideo(videoUrl);
	};
	
	//Stops the astronaut video
	$("#stopButton").click(function() {
		changeVideo("");
	});
	
	$("#jobFinished").click(function() {
		socket.emit("job finished");
		$("#jobFinished").attr("disabled", "true");
	});
	
	$("#astronautHappy").click(function() {
		changeVideo(happyVideoUrl);
	});
	
	$("#astronautNervous").click(function() {
		changeVideo(nervousVideoUrl);
	});
	
	socket.on("change video", changeLocalVideo);
	
	socket.emit("get mission time left");
	
	//Check if the mission has already started
	socket.on("mission time left", function(timeLeft) {
		if (timeLeft > 0) {
			$("#changeMissionTime").show();
			$("#jobFinished").show();
			startMissionTimer(Math.floor(timeLeft / 1000 / 60));
			$("#startMission").html("Stopp oppdrag");
			missionStarted = true;
		}
	});
	
	socket.on("mission started", function(missionLength) {
		startMissionTimer(Math.floor(missionLength / 1000 / 60));
		$("#startMission").html("Stopp oppdrag");
		$("#startMission").removeAttr("disabled");
		$("#jobFinished").show();
		$("#jobFinished").removeAttr("disabled");
		$("#changeMissionTime").show();
		missionStarted = true;
		console.log("Mission started");
	});
	
	socket.on("mission stopped", function() {
		$("#startMission").html("Start oppdrag");
		$("#startMission").removeAttr("disabled");
		$("#changeMissionTime").hide();
		$("#jobFinished").hide();
		missionStarted = false;
		stopMissionTimer();
		console.log("Mission stopped");
	});
	
	$("#startMission").click(function() {
		var missionLength = parseInt($("#missionLength").val(), 10);
		
		if (!missionStarted && missionLength > 0) {
			$("#startMission").attr("disabled", "true");
			socket.emit("start mission", missionLength * 60 * 1000);
		}
		else if (missionStarted) {
			$("#startMission").attr("disabled", "true");
			socket.emit("stop mission");
		}
	});
	
	$("#changeMissionTime").click(function() {
		var missionLength = parseInt($("#missionLength").val(), 10);
		
		if (missionStarted && missionLength > 0) {
			socket.emit("change mission length", missionLength * 60 * 1000);
		}
	});
	
	socket.on("mission length changed", function(missionLength) {
		startMissionTimer(Math.floor(missionLength / 1000 / 60));
	});
	
	rtcHelper.id = id;
	rtcHelper.socket = socket;
	
	socket.on('call', rtcHelper.onIncomingCall);
	
	$("#answerButton").click(rtcHelper.answerIncomingCall);
	
	$("#callSecurityTeam").click(function() {
		rtcHelper.call("security");
	});
	
	$("#callCommunicationTeam").click(function() {
		rtcHelper.call("communication");
	});
	
	$("#hangUp").click(rtcHelper.hangUp);
};