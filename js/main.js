const video = document.getElementById("video");
let predictedAges = [];
var chart;
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia(
        { video: true }).then(stream => {
            document.getElementById('video').srcObject = stream;
        }).catch(error => {
            console.log(error);
        })
}

const getExpressionData = (val) => {
    temp = val.split(" ")
    return { x: temp[0], value: +temp[1].slice(1, temp[1].length - 1) }
}

let emotion = [{ x: "happy", value: 10 },];

video.addEventListener("playing", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.width * 10, height: video.height * 10 };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        var x = faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        // console.log(x)
        // console.table(x)
        x.forEach((e) => {
            // emotion=getExpressionData(e);
            // expdata(e);
            const newExp = getExpressionData(e);
            console.log(newExp);
            let isNewExp = true;
            emotion.forEach((em, i) => {
                if (em.x === newExp.x) {
                    // console.log(em.x)
                    // console.log(newExp)
                    // console.log(emotion[i], newExp)
                    emotion[i]["value"] += newExp["value"]
                    isNewExp = false
                }
            })
            if (isNewExp) emotion = [...emotion, newExp];
            chart.data(emotion);
            chart.draw();
        })

        const age = resizedDetections[0].age;

        const interpolatedAge = interpolateAgePredictions(age);
        const bottomRight = {
            x: resizedDetections[0].detection.box.bottomRight.x - 50,
            y: resizedDetections[0].detection.box.bottomRight.y
        };

        new faceapi.draw.DrawTextField(
            [`${faceapi.utils.round(interpolatedAge, 0)} years`],
            bottomRight
        ).draw(canvas);
    }, 100);

});

function interpolateAgePredictions(age) {
    predictedAges = [age].concat(predictedAges).slice(0, 30);
    const avgPredictedAge =
        predictedAges.reduce((total, a) => total + a) / predictedAges.length;
    return avgPredictedAge;
}

anychart.onDocumentReady(() => {
    console.log("emotion")
    //    console.log(emotion)
    // set the data

    // create the chart
    chart = anychart.pie();

    // set the chart title
    chart.title("Facial Emotions");

    // add the data
    chart.data(emotion);

    // sort elements
    chart.sort("desc");

    // set legend position
    chart.legend().position("top");
    // set items layout
    chart.legend().itemsLayout("vertical");

    // display the chart in the container
    chart.container('container');
    chart.draw();

});
