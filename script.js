let records = [];
let currentDay = 1;
let selectedUrinationTimes = new Set();

// ページ読み込み時にローカルストレージからデータを取得
window.onload = () => {
    const storedRecords = localStorage.getItem('records');
    if (storedRecords) {
        records = JSON.parse(storedRecords);

    }
};

function goToDay(day) {
    currentDay = day;

    // ローカルストレージからデータを読み込み
    const storedRecords = localStorage.getItem('records');
    if (storedRecords) {
        records = JSON.parse(storedRecords);
    }


    // 現在の日付の記録がない場合は初期化
    if (!records[currentDay - 1]) {
        records[currentDay - 1] = {
            date: '',
            sleepTime: '',
            wakeTime: '',
            totalSleepTime: '',
            napTimes: [],
            exerciseTimes: [],
            urinationTimes: [],
            drinking: '',
            medications: [] // 服薬情報を保存
        };
    }
    const record = records[currentDay - 1];

    // 画面のタイトルを日付に合わせる
    document.getElementById('day-title').textContent = `${day}日目`;
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('record-page').style.display = 'block';


    // 選択された排尿時刻のセットをクリア
    selectedUrinationTimes.clear();


    // 排尿時刻ボタンを生成し、選択状態を復元
    const urinationButtonsDiv = document.getElementById('urination-buttons');
    urinationButtonsDiv.innerHTML = '';

    for (let i = 0; i < 24; i++) {
        const button = document.createElement('button');
        button.className = 'urination-button';
        button.textContent = `${i}:00-`;
        button.onclick = () => toggleUrinationTime(i);

        // 選択された排尿時刻を復元
        if (record.urinationTimes.includes(`${String(i).padStart(2, '0')}:30`)) {
            button.classList.add('selected');
            selectedUrinationTimes.add(i);
        }

        urinationButtonsDiv.appendChild(button);
    }



    toggleDrinking(record.drinking);



    // その他のデータの初期化または表示
    document.getElementById('date-picker').value = record.date;
    document.getElementById('sleep-time').value = record.sleepTime;
    document.getElementById('wake-time').value = record.wakeTime;
    for (let i = 0; i < 24; i++)

        // 他の入力フィールドの値を設定
        if (record) {
            document.getElementById('date-picker').value = record.date || '';
            document.getElementById('sleep-time').value = record.sleepTime || '';
            document.getElementById('wake-time').value = record.wakeTime || '';

            const napTimesDiv = document.getElementById('nap-times');
            napTimesDiv.innerHTML = '';
            record.napTimes.forEach(nap => addNapTime(nap.start, nap.end));

            const exerciseTimesDiv = document.getElementById('exercise-times');
            exerciseTimesDiv.innerHTML = '';
            record.exerciseTimes.forEach(exercise => addExerciseTime(exercise.start, exercise.end));
        } else {
            document.getElementById('date-picker').value = '';
            document.getElementById('sleep-time').value = '';
            document.getElementById('wake-time').value = '';

            const napTimesDiv = document.getElementById('nap-times');
            napTimesDiv.innerHTML = '';
            addNapTime();

            const exerciseTimesDiv = document.getElementById('exercise-times');
            exerciseTimesDiv.innerHTML = '';
            addExerciseTime();
        }
    // Initialize fields
    document.getElementById('date-picker').value = record.date || '';
    document.getElementById('sleep-time').value = record.sleepTime || '';
    document.getElementById('wake-time').value = record.wakeTime || '';

    calculateTotalSleepTime(); // 総睡眠時間の初期計算を呼び出す

}

function toggleUrinationTime(hour) {
    const buttons = document.querySelectorAll('.urination-button');
    const button = buttons[hour];

    if (selectedUrinationTimes.has(hour)) {
        selectedUrinationTimes.delete(hour);
        button.classList.remove('selected');
    } else {
        selectedUrinationTimes.add(hour);
        button.classList.add('selected');
    }
}


function saveRecord() {
    const date = document.getElementById('date-picker').value;
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;
    const drinking = records[currentDay - 1].drinking || '無'; // `toggleDrinking()`で更新済み
    const urinationTimes = Array.from(selectedUrinationTimes).map(hour => {
        // 時間を「:30」に変換
        return `${String(hour).padStart(2, '0')}:30`;
        const urinationTimes = Array.from(selectedUrinationTimes);
        const medications = Array.from(selectedMedications);
    });


    // 昼寝時間の取得
    const napTimes = [];
    const napStartTimes = document.querySelectorAll('.nap-start-time');
    const napEndTimes = document.querySelectorAll('.nap-end-time');

    for (let i = 0; i < napStartTimes.length; i++) {
        if (napStartTimes[i].value && napEndTimes[i].value) {
            napTimes.push({
                start: napStartTimes[i].value,
                end: napEndTimes[i].value
            });
        }
        localStorage.setItem('records', JSON.stringify(records));

        // 現在の日のボタンの色を変更
        const dayButton = document.getElementById(`day-button-${currentDay}`);
        if (dayButton) {
            dayButton.style.backgroundColor = 'gray';
        }

        records[currentDay - 1].totalSleepTime = document.getElementById('total-sleep-time').textContent;

        drawGraph(currentDay); // グラフを描写
        goToTopPage(); // トップページに戻る



    }

    function isInNightPeriod(sleepTime, wakeTime, time) {
        const sleepMinutes = timeToMinutes(sleepTime);
        const wakeMinutes = timeToMinutes(wakeTime);
        const urinationMinutes = timeToMinutes(time);

        // 睡眠時間が日をまたぐ場合
        if (sleepMinutes > wakeMinutes) {
            return urinationMinutes >= sleepMinutes || urinationMinutes < wakeMinutes;
        } else {
            return urinationMinutes >= sleepMinutes && urinationMinutes < wakeMinutes;
        }
    }

    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // 運動時間の取得
    const exerciseTimes = [];
    const exerciseStartTimes = document.querySelectorAll('.exercise-start-time');
    const exerciseEndTimes = document.querySelectorAll('.exercise-end-time');

    for (let i = 0; i < exerciseStartTimes.length; i++) {
        if (exerciseStartTimes[i].value && exerciseEndTimes[i].value) {
            exerciseTimes.push({
                start: exerciseStartTimes[i].value,
                end: exerciseEndTimes[i].value
            });
        }
    }


    const nightUrinationCount = urinationTimes.filter(time => isInNightPeriod(sleepTime, wakeTime, time)).length;

    records[currentDay - 1] = {
        date,
        sleepTime,
        wakeTime,
        napTimes,
        exerciseTimes,
        urinationTimes,
        totalUrinationCount: urinationTimes.length,
        nightUrinationCount,
        drinking,
    };
    // ローカルストレージにデータを保存
    localStorage.setItem('records', JSON.stringify(records));


    // ボタンの色を灰色に変更
    const dayButton = document.getElementById(`day-button-${currentDay}`);
    if (dayButton) {
        dayButton.style.backgroundColor = 'gray';
    }
    drawGraph(currentDay); // グラフを描写
    goToTopPage(); // トップページに戻る
}

function addNapTime(start = '', end = '') {
    const napTimesDiv = document.getElementById('nap-times');

    // 昼寝開始時刻の入力フィールド
    const newStartTimeLabel = document.createElement('label');
    newStartTimeLabel.textContent = '昼寝開始時刻:';
    const newStartTimeInput = document.createElement('input');
    newStartTimeInput.type = 'time';
    newStartTimeInput.className = 'nap-start-time';
    newStartTimeInput.value = start;

    // 昼寝終了時刻の入力フィールド
    const newEndTimeLabel = document.createElement('label');
    newEndTimeLabel.textContent = '昼寝終了時刻:';
    const newEndTimeInput = document.createElement('input');
    newEndTimeInput.type = 'time';
    newEndTimeInput.className = 'nap-end-time';
    newEndTimeInput.value = end;

    napTimesDiv.appendChild(newStartTimeLabel);
    napTimesDiv.appendChild(newStartTimeInput);
    napTimesDiv.appendChild(newEndTimeLabel);
    napTimesDiv.appendChild(newEndTimeInput);
}

function addExerciseTime(start = '', end = '') {
    const exerciseTimesDiv = document.getElementById('exercise-times');

    // 運動開始時刻の入力フィールド
    const newStartTimeLabel = document.createElement('label');
    newStartTimeLabel.textContent = '運動開始時刻:';
    const newStartTimeInput = document.createElement('input');
    newStartTimeInput.type = 'time';
    newStartTimeInput.className = 'exercise-start-time';
    newStartTimeInput.value = start;

    // 運動終了時刻の入力フィールド
    const newEndTimeLabel = document.createElement('label');
    newEndTimeLabel.textContent = '運動終了時刻:';
    const newEndTimeInput = document.createElement('input');
    newEndTimeInput.type = 'time';
    newEndTimeInput.className = 'exercise-end-time';
    newEndTimeInput.value = end;

    exerciseTimesDiv.appendChild(newStartTimeLabel);
    exerciseTimesDiv.appendChild(newStartTimeInput);
    exerciseTimesDiv.appendChild(newEndTimeLabel);
    exerciseTimesDiv.appendChild(newEndTimeInput);
}

function goToAggregatePage() {
    const allGraphsDiv = document.getElementById('all-graphs');
    allGraphsDiv.innerHTML = '';
    records.forEach((record, index) => {
        if (record && record.sleepTime && record.wakeTime) {
            const day = index + 1;
            const graphContainer = document.createElement('div');
            graphContainer.innerHTML = `<h3>${day}日目の記録</h3><canvas id="graph-${day}" width="400" height="400"></canvas>`;
            allGraphsDiv.appendChild(graphContainer);
            drawGraph(day, true);
        }
    });
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('aggregate-page').style.display = 'block';
}

function drawGraph(day, aggregate = false) {
    const record = records[day - 1];
    if (!record) return;

    const canvas = document.getElementById(`graph-${day}`);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    // メイン円グラフの太さを設定
    ctx.lineWidth = 3;
    ctx.arc(200, 200, 150, 0, 2 * Math.PI);
    ctx.stroke();

    const sleepAngle = timeToAngle(record.sleepTime);
    const wakeAngle = timeToAngle(record.wakeTime);

    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 12;
    ctx.arc(200, 200, 150, sleepAngle, wakeAngle);
    ctx.stroke();



    // 複数の昼寝時間を描画
    record.napTimes.forEach(nap => {
        const napStartAngle = timeToAngle(nap.start);
        const napEndAngle = timeToAngle(nap.end);

        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 12;
        ctx.arc(200, 200, 150, napStartAngle, napEndAngle);
        ctx.stroke();
    });

    // 複数の運動時間を描画（ピンク色）
    record.exerciseTimes.forEach(exercise => {
        const exerciseStartAngle = timeToAngle(exercise.start);
        const exerciseEndAngle = timeToAngle(exercise.end);

        ctx.beginPath();
        ctx.strokeStyle = 'pink';
        ctx.lineWidth = 12;
        ctx.arc(200, 200, 150, exerciseStartAngle, exerciseEndAngle);
        ctx.stroke();
    });


    // 排尿時刻の描画
    ctx.fillStyle = 'red';
    record.urinationTimes.forEach(time => {
        const angle = timeToAngle(time);
        const x = 200 + 150 * Math.cos(angle);
        const y = 200 + 150 * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
    });

    // 文字盤の描画
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    const offset = 170;
    ctx.fillText('0:00', 200 - 15, 200 - offset);
    ctx.fillText('6:00', 200 + offset - 10, 205);
    ctx.fillText('12:00', 200 - 15, 200 + offset + 5);
    ctx.fillText('18:00', 200 - offset - 20, 205);

    // サマリー情報の描画
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${record.date}`, 200, 120);
    ctx.fillText(``, 200, 140);

    ctx.fillText(`入眠: ${record.sleepTime}`, 200, 180);
    ctx.fillText(`起床: ${record.wakeTime}`, 200, 200);
    ctx.fillText(`総排尿回数: ${record.totalUrinationCount}`, 200, 220);
    ctx.fillText(`夜間排尿回数: ${record.nightUrinationCount}`, 200, 240);
    ctx.fillText(`飲酒: ${record.drinking}`, 200, 260); // 飲酒の有無を表示

}

function timeToAngle(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const totalMinutes = (hours % 24) * 60 + minutes;
    const angle = ((totalMinutes / 1440) * 2 * Math.PI) - Math.PI / 2;
    return angle;
}



function goToTopPage() {
    document.getElementById('record-page').style.display = 'none';
    document.getElementById('aggregate-page').style.display = 'none';
    document.getElementById('start-page').style.display = 'none';
    document.getElementById('guide-page').style.display = 'none';
    document.getElementById('top-page').style.display = 'block';
}


function showStartPage() {
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('record-page').style.display = 'none';
    document.getElementById('aggregate-page').style.display = 'none';
    document.getElementById('start-page').style.display = 'block';
}

function showGuidePage() {
    document.getElementById('top-page').style.display = 'none';
    document.getElementById('record-page').style.display = 'none';
    document.getElementById('aggregate-page').style.display = 'none';
    document.getElementById('guide-page').style.display = 'block';
}

function addUrinationTime() {
    const urinationTimesDiv = document.getElementById('urination-times');
    const newTimeInput = document.createElement('input');
    newTimeInput.type = 'time';
    newTimeInput.className = 'urination-time';
    urinationTimesDiv.appendChild(newTimeInput);
}

function toggleDrinking(status) {
    const buttons = document.querySelectorAll('.drinking-button');
    buttons.forEach(button => button.classList.remove('selected'));

    if (status) {
        // 飲酒状態が指定されている場合にのみボタンを選択状態にする
        const selectedButton = document.getElementById(`drink-${status === '有' ? 'yes' : 'no'}`);
        selectedButton.classList.add('selected');
    }

    // 飲酒状態を記録に保存
    if (!records[currentDay - 1]) {
        records[currentDay - 1] = {};
    }
    records[currentDay - 1].drinking = status || ''; // 初期状態は空文字列

    // ローカルストレージに更新内容を保存
    localStorage.setItem('records', JSON.stringify(records));
}

let selectedMedications = new Set();

// 服薬ボタンの選択状態を切り替える
function toggleMedication(medication) {
    // 選択された薬の存在を確認して、selectedMedicationsを更新
    const index = selectedMedications.indexOf(medication);
    if (index > -1) {
        // 既に選択されている場合、削除
        selectedMedications.splice(index, 1);
    } else {
        // 選択されていない場合、追加
        selectedMedications.push(medication);
    }

    // ローカルストレージに保存する
    localStorage.setItem('selectedMedications', JSON.stringify(selectedMedications));
}

function calculateTotalSleepTime() {
    const sleepTime = document.getElementById('sleep-time').value;
    const wakeTime = document.getElementById('wake-time').value;

    if (sleepTime && wakeTime) {
        const sleepMinutes = timeToMinutes(sleepTime);
        const wakeMinutes = timeToMinutes(wakeTime);
        const totalMinutes = (wakeMinutes > sleepMinutes) ?
            wakeMinutes - sleepMinutes :
            1440 - sleepMinutes + wakeMinutes;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const totalSleepTime = `${hours}時間${minutes}分`;

        document.getElementById('total-sleep-time').textContent = `総睡眠時間: ${totalSleepTime}`;
        records[currentDay - 1].totalSleepTime = totalSleepTime; // データ保存用
        localStorage.setItem('records', JSON.stringify(records)); // ローカルストレージに保存
    }
}

function deleteRecord() {
    const confirmation = confirm(`${currentDay}日目の記録を削除しますか？`);
    if (!confirmation) return;

    // 該当日のデータを削除
    records[currentDay - 1] = {
        date: '',
        sleepTime: '',
        wakeTime: '',
        napTimes: [],
        exerciseTimes: [],
        urinationTimes: [],
        totalUrinationCount: 0,
        nightUrinationCount: 0,
        drinking: ''
    };

    // ローカルストレージの更新
    localStorage.setItem('records', JSON.stringify(records));

    // ボタンの色を緑に変更
    const dayButton = document.getElementById(`day-button-${currentDay}`);
    if (dayButton) {
        dayButton.style.backgroundColor = '#4CAF50';
    }
    // 指定日付のデータを初期化するために goToDay 関数を呼び出し
    goToDay(currentDay);
}

function updateButtonColors() {
    // ローカルストレージからデータを取得
    const records = JSON.parse(localStorage.getItem('records')) || [];

    records.forEach((record, index) => {
        const dayButton = document.getElementById(`day-button-${index + 1}`);

        // 記録が存在するかを確認
        if (record && record.date) {
            dayButton.style.backgroundColor = 'gray';
        } else {
            dayButton.style.backgroundColor = '#45a049';
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const text = "日々の記録";
    const h1Element = document.getElementById("typingText");
    let index = 0;

    function typeText() {
        if (index < text.length) {
            h1Element.textContent += text.charAt(index);
            index++;
            setTimeout(typeText, 150); // 350msごとに1文字追加
        } else {
            h1Element.classList.remove("typing");
        }
    }

    h1Element.textContent = ''; // 初期化しておく
    h1Element.classList.add("typing"); // タイピング効果用のクラスを追加
    typeText();
});

// ページ読み込み時にローカルストレージからデータを取得
window.onload = () => {
    const storedRecords = localStorage.getItem('records');
    if (storedRecords) {
        records = JSON.parse(storedRecords);
        updateButtonColors(); // ボタンの色を更新

        // グラフをリロード時に描写
        records.forEach((record, index) => {
            if (record && record.sleepTime && record.wakeTime) {
                drawGraph(index + 1, true); // index + 1 は日付を意味します
            }
        });
    }
};
