// Configuration PIT object
const PITconfig = {
  magnitudes: [1, 2, 5],
  ratios: [16, 8, 1],
  RPPs: [0.0625, 0.25, 5.0],
  coins: [1, 0.01, -1, -0.01],
  trialDuration: 7000 // in milliseconds on average, U[9500, 10500]
};

const PITtrialList = [{"magnitude":2,"ratio":8,"coin":-0.01,"trialDuration":6902},{"magnitude":5,"ratio":8,"coin":1,"trialDuration":7221},{"magnitude":2,"ratio":1,"coin":0.01,"trialDuration":7228},{"magnitude":1,"ratio":1,"coin":-1,"trialDuration":7044},{"magnitude":1,"ratio":8,"coin":0.5,"trialDuration":6506},{"magnitude":2,"ratio":16,"coin":-1,"trialDuration":6827},{"magnitude":1,"ratio":1,"coin":0.5,"trialDuration":6890},{"magnitude":2,"ratio":8,"coin":1,"trialDuration":7236},{"magnitude":2,"ratio":16,"coin":-0.5,"trialDuration":7465},{"magnitude":2,"ratio":16,"coin":-0.01,"trialDuration":7207},{"magnitude":2,"ratio":1,"coin":-0.5,"trialDuration":6535},{"magnitude":5,"ratio":8,"coin":0.5,"trialDuration":7376},{"magnitude":2,"ratio":1,"coin":-0.01,"trialDuration":6652},{"magnitude":1,"ratio":1,"coin":0.01,"trialDuration":7199},{"magnitude":1,"ratio":8,"coin":1,"trialDuration":7293},{"magnitude":1,"ratio":8,"coin":-0.5,"trialDuration":6870},{"magnitude":2,"ratio":8,"coin":-1,"trialDuration":6962},{"magnitude":2,"ratio":1,"coin":-1,"trialDuration":7490},{"magnitude":1,"ratio":8,"coin":0.01,"trialDuration":6688},{"magnitude":1,"ratio":1,"coin":1,"trialDuration":7145},{"magnitude":5,"ratio":8,"coin":0.01,"trialDuration":7261},{"magnitude":2,"ratio":8,"coin":0.01,"trialDuration":6891},{"magnitude":5,"ratio":8,"coin":-1,"trialDuration":7386},{"magnitude":2,"ratio":8,"coin":-0.5,"trialDuration":6888},{"magnitude":1,"ratio":1,"coin":-0.01,"trialDuration":6985},{"magnitude":5,"ratio":8,"coin":-0.5,"trialDuration":6956},{"magnitude":1,"ratio":8,"coin":-0.01,"trialDuration":6862},{"magnitude":1,"ratio":8,"coin":-1,"trialDuration":7182},{"magnitude":2,"ratio":16,"coin":0.5,"trialDuration":7452},{"magnitude":2,"ratio":1,"coin":0.5,"trialDuration":7009},{"magnitude":1,"ratio":1,"coin":-0.5,"trialDuration":6726},{"magnitude":2,"ratio":16,"coin":1,"trialDuration":6679},{"magnitude":5,"ratio":8,"coin":-0.01,"trialDuration":6666},{"magnitude":2,"ratio":16,"coin":0.01,"trialDuration":6954},{"magnitude":2,"ratio":8,"coin":0.5,"trialDuration":6501},{"magnitude":2,"ratio":1,"coin":1,"trialDuration":6825}];

// Trial stimulus function
//TODO: add tiled background
function generatePITstimulus(coin, ratio) {
  const ratio_index = experimentConfig.ratios.indexOf(ratio);
  // Calculate saturation based on ratio
  const ratio_factor = ratio_index / (experimentConfig.ratios.length - 1);
  const piggy_style = `filter: saturate(${50 * (400 / 50) ** ratio_factor}%);`;
  if (coin === 1) {
    piggyBgImg = 'imgs/cielab_1.png'
  } else if (coin === 0.5) {
    piggyBgImg = 'imgs/cielab_2.png'
  } else if (coin === 0.01) {
    piggyBgImg = 'imgs/cielab_3.png'
  } else if (coin === -1) {
    piggyBgImg = 'imgs/cielab_4.png'
  } else if (coin === -0.5) {
    piggyBgImg = 'imgs/cielab_5.png'
  } else if (coin === -0.01) {
    piggyBgImg = 'imgs/cielab_6.png'
  }
  return `
    <div class="experiment-wrapper" style="background-image: url(${piggyBgImg});background-repeat: repeat-x; background-size: 24vh; background-position-y: 20vh;">
      <!-- Middle Row (Piggy Bank & Coins) -->
      <div id="experiment-container">
        <div id="piggy-container">
          <!-- Piggy Bank Image -->
          <img id="piggy-bank" src="imgs/piggy-bank.png" alt="Piggy Bank" style="${piggy_style}">
        </div>
        <div id="obstructor-container">
          <img id="obstructor" src="imgs/occluding_clouds.png" alt="Obstructor">
        </div>
      </div>
    </div>
  `;
}

// PIT trial
let PITtrialCounter = 0;
const PITtrial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function () {
    return generatePITstimulus(jsPsych.evaluateTimelineVariable('coin'), jsPsych.evaluateTimelineVariable('ratio'));
  },
  choices: 'NO_KEYS',
  // response_ends_trial: false,
  trial_duration: jsPsych.timelineVariable('trialDuration'),
  save_timeline_variables: ["magnitude", "ratio"],
  data: {
    trialphase: 'pit_trial',
    pit_coin: () => { return jsPsych.evaluateTimelineVariable('coin') },
    trial_duration: () => { return jsPsych.evaluateTimelineVariable('trialDuration') },
    response_time: () => { return window.responseTime },
    trial_presses: () => { return window.trialPresses },
    trial_reward: () => { return window.trialReward },
    // Record global data
    total_presses: () => { return window.totalPresses },
    total_reward: () => { return window.totalReward }
  },
  simulation_options: {
    data: {
      trial_presses: () => { window.trialPresses = jsPsych.randomization.randomInt(8, 20) },
      trial_reward: () => { window.trialReward = Math.floor(window.trialPresses / jsPsych.evaluateTimelineVariable('ratio')) * jsPsych.evaluateTimelineVariable('magnitude') },
      response_time: () => {
        do {
          window.responseTime = [];
          for (let i = 0; i < window.trialPresses; i++) {
            window.responseTime.push(Math.floor(jsPsych.randomization.sampleExGaussian(150, 15, 0.01, true)));
          }
        } while (window.responseTime.reduce((acc, curr) => acc + curr, 0) > experimentConfig.trialDuration);
      },
      total_presses: () => { window.totalPresses += window.trialPresses },
      total_reward: () => { window.totalReward += window.trialReward }
    }
  },
  on_start: function (trial) {
    if (window.prolificPID.includes("simulate")) {
      trial.trial_duration = 1000 / 60;
    }
    // Create a shared state object
    window.trialPresses = 0;
    window.trialReward = 0;
    window.responseTime = [];

    let lastPressTime = 0;
    let pressCount = 0;

    const ratio = jsPsych.evaluateTimelineVariable('ratio');
    const magnitude = jsPsych.evaluateTimelineVariable('magnitude');

    const keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: function (info) {
        window.responseTime.push(info.rt - lastPressTime);
        lastPressTime = info.rt;
        // wigglePiggy();
        shakePiggy();
        pressCount++;
        window.trialPresses++;
        window.totalPresses++;

        if (pressCount === ratio) {
          window.trialReward += magnitude;
          window.totalReward += magnitude;
          pressCount = 0;
        }
      },
      valid_responses: ['b'],
      rt_method: 'performance',
      persist: true,
      allow_held_key: false,
      minimum_valid_rt: 0
    });
  },
  on_load: function () {
    updatePiggyTails(jsPsych.evaluateTimelineVariable('magnitude'), jsPsych.evaluateTimelineVariable('ratio'));
  },
  on_finish: function (data) {
    // Clean up listener
    jsPsych.pluginAPI.cancelAllKeyboardResponses();
    PITtrialCounter += 1;
    data.pit_trial_number = PITtrialCounter;
    if (PITtrialCounter % (PITtrials.length / 3) == 0 || PITtrialCounter == PITtrials.length) {
      saveDataREDCap(retry = 0); // TODO: Change to 3
    }
  }
};

// Create timeline for PIT task
const PITtrials = [];
PITtrialList.forEach(trial => {
  PITtrials.push({
    timeline: [PITtrial],
    timeline_variables: [trial]
  });
});

function getSelectedPITtrial() {
  const raw_data = jsPsych.data.get().filterCustom((trial) => trial.trialphase == "pit_trial");
  const trial_rewards = raw_data.select('trial_reward').values;
  // Select a random trial to be the bonus round with weights based on the rewards
  const selected_trial = jsPsych.randomization.sampleWithReplacement(raw_data.values(), 1, trial_rewards.map(reward => logNormalPDF(reward, Math.log(90), 0.3)));
  // Side effect: Save the reward for the bonus round
  window.sampledPITreward = selected_trial[0].trial_reward;
  // Return the trial index for referencing and the trial number for display
  return { trial_index: selected_trial[0].trial_index, pit_trial_number: selected_trial[0].pit_trial_number };
}

const PIT_bonus = {
  type: jsPsychHtmlButtonResponse,
  stimulus: "Congratulations! You've finished this game!",
  choices: ['Finish'],
  data: { trialphase: 'pit_bonus' },
  on_start: function (trial) {
    const selected_trial = getSelectedPITtrial();
    trial.stimulus = `
            <p>It is time to reveal your bonus payment for this round of piggy-bank game.</p>
            <p>The computer selected piggy bank number ${selected_trial.pit_trial_number}, which means you will earn ${(window.sampledPITreward / 100).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })} for the game.</p>
        `;
  },
  on_finish: (data) => {
    data.PIT_bonus = window.sampledPITreward / 100
  },
  simulation_options: {
    simulate: false
  }
};

// Instructions for comparison task
const PITinstructions = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div id="instruction-text" style="text-align: left">
      <p><strong>You are in a different room now.</strong></p>
      <p><span class="highlight">Your job is to choose which one you would prefer to play with in the future.</span></p>
      <p>Press <span class="spacebar-icon">Spacebar</span> to begin the task.</p>
    </div>
  `,
  data: { trialphase: 'pit_instructions' },
  choices: [' '],
  post_trial_gap: 300
};