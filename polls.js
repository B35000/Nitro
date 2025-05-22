
const { parentPort, workerData } = require('worker_threads');

var votes = []/* all the votes, each voter ordered their preferred candidates, with their most preferred at the leftmost side and their least preferred at the rightmost side */
var candidates = []/* the candidates in the ballot */
var target_positions = 1/* the number of positions or seats to fill. If the election is instant-runoff, targeted_positions should be just 1. */
var selected = []/* the selected candidates who reached the quota */
var consensus_snapshots = []/* snapshots of the consensus at different stages or runoffs */
var elimination_snapshot = []/* snapshot of the candidates that were eliminated during different stages or runoffs. */
var predefinied_random_value = 0.53/* a predefined random number used during the tie breaking process during elimination of candidates. This is necessary for preventing consensus inconsistency in results. */
var consensus_tie = false;
var tie_breaker = ''
var registered_voters = 0





/* returns the candidates who have reached the targeted quota at a particular stage or runoff */
function get_qualifiers_if_any(primary_totals, quota){
    const result = Object.entries(primary_totals)
            .filter(([_, arr]) => arr.length === quota)
            .map(([key]) => key);/* foreach entry, filter the value which is an array by its length equaling the quota, then populate a new array with the keys that match the valid arrays */
    return result
}

/* returns the candidate who got the least number of votes in previous stages or runoffs. If tied in all runoffs, or its the first stage of an election, the predefinied_random_value is used to select the candidate to elminiate */
function select_tie_breaker(unfortunate_candidates){
	if(unfortunate_candidates.length == 1) return 0/* if its just one candidate, return their position */
	var pos = -1/* start with -1 as the selected position */
    var e = 0/* start with 0 as the position of the consensus snapshot in focus (the snapshot that involves the voters' most preferred choices). This will be incremented if an elimination candidate isnt found. */
    var selected_candidates = unfortunate_candidates.slice()/* create a clone of the unfortunate_candidates parameter to use. */
    while(pos == -1){/* keep looping while the pos value is -1 */
        if(consensus_snapshots.length > 0 && consensus_snapshots.length > e){/* if the consensus snapshot array is not empty and e is less than its length */
            var focused_snapshot = consensus_snapshots[e]/* focus on the snapshot at position e */
            var arr = []/* initialize an empty array */
            selected_candidates.forEach(unfortunate_candid => {
                arr.push(focused_snapshot[unfortunate_candid])
            });/* record the number of votes for each of the candidates in the focused snapshot */
            const maxValue = Math.max(...arr)/* get the largest vote count in the array */
            const positions = arr.reduce((acc, val, index) => {
                if (val === maxValue) acc.push(index);
                return acc;
            }, []);/* get the positions which had the largest vote count obtained above */
            if(positions.length < selected_candidates.length){/* if the positions obtained is less than the number of candidates in focus. This is to prevent eliminating all the candidates at once if they all had the same number of votes */
                positions.forEach(position => {
                    selected_candidates.splice(position, 1)
                });/* remove the positions in focus from the selected_candidates array */
                if(selected_candidates.length == 1){/* if the number of candidates left is just one, set the pos value as their position to end the while loop */
                    pos = selected_candidates[0]
                }else{
                    /* if multiple candidates remain, just increment e and move on to the next consensus snapshot */
                    e++
                }
            }else{
                /* All of the canididates were in focus, so move on to the next consensus snapshot by incrementing e */
                e++
            }
        }else{
            /* the snapshots were insufficient for selecting a candidate to eliminate, so the position will be selected using the predefined random value. */
            pos = Math.floor(predefinied_random_value * selected_candidates.length)
        }
  }
  
  var selected_c = selected_candidates[pos]/* get the selected candidate from the pos value in the selected_candidates array */
  return unfortunate_candidates.indexOf(selected_c)/* return their position in the supplied unfortunate_candidates argument. */
}

/* eliminates the losers in a particular stage by the number of votes they received */
function eliminate_losers(primary_totals){
    const minLength = Math.min(...Object.values(primary_totals).map(arr => arr.length));/* obtains the minimum number of votes that one of the candidates received */
    const result = Object.entries(primary_totals)/* foreach key in the primary_totals object */
        .filter(([_, arr]) => arr.length === minLength)/* filter each key by its value being the number of votes they received equaling the minimum number obtained above */
        .map(([key]) => key);/* set all the filtered keys which should be the candidates' names into an array */
 
 	var selected_loser_pos = select_tie_breaker(result)/* call the tie breaker function with the result array of losers with the least votes */
 	var candidate = result[selected_loser_pos]/* select the canidate obtained from the tie breaker function */
    const their_voters = primary_totals[candidate]/* focus on all their voters */
    their_voters.forEach(voter => {
        votes[voter].splice(0, 1)
    });/* foreach voter, remove their eliminated candidate's vote and shift to their next preferred option  */
    const index = candidates.indexOf(candidate)
    if(index != -1){
        candidates.splice(index, 1)
        elimination_snapshot.push(candidate)
    }/* remove the candidate from the list of candidates since they have been eliminated */
}

/* main function used to calculate the winner of an election using single transferrable vote or propotinal-ranked choice voting for multi-winner elections (using the droop quota function exclusively) and instant-runoff elections for single-winner elections. */
function calculate_winner(){
    if(votes.length == 0){/* if no votes were found, return */
        return;
    }
    /* 
        primary_totals = {
            'green': [0,1,2,3], <----- this array contains the positions of the voters in the vote array that voted for them.
            'red': [7,8,12],
            ...
        }
        sub_voter_data = {
            'green': 4, <----- this is simply the number of votes they received as their main choice
            'red': 3,
            ...
        }
    */
	const primary_totals = {}/* object that is set to contain the consensus totals for each candidate */
    const sub_voter_data = {}/* object that is set to contain the total number of votes for each candidate. This is different from the primary_totals object in that, the primary_totals contains candidates names as keys that point to arrays that contain positions for each voter in the votes array; while this just points to a number that is the total number of votes they got. */
    const total_vote_count = votes.length/* the total number of votes that have been cast */
    const quota = Math.floor((total_vote_count / (target_positions+1)) +1)/* the quota that is meant to be achieved by each candidate in the election. The droop quota function is used here.
        droop_quota = (total_number_of_votes / (number_of_targeted_positions + 1)) + 1

        Note: if the number of targeted postions is just one (its an instant-runoff election) then teh quota will be equal to excatly 50% of the cast votes plus one.
    */
    
    for(var i=0; i<votes.length; i++){/* for each vote */
        var focused_vote_object = votes[i]/* intitialize a variable containing a specific vote in focus. */
        var primary_vote = focused_vote_object[0]/* select their primary or first vote or preferrential vote */
        
        while(!candidates.includes(primary_vote)){
            votes[i].splice(0, 1)
            primary_vote = focused_vote_object[0]
        }/* if the primary vote selected above is for a voter who was eliminated in a previous stage, remove that vote and focus on their next preferred candidate. This is done repeatedly until a candidate whose still in the race is found. */
        
        if(primary_totals[primary_vote] != null){/* if the candidate's voters' array array is initialized in the primary_totals object */
            var focused_totals = primary_totals[primary_vote].length/* initialize a variable containing the number of votes that have been counted. */
            while(focused_totals == quota || !candidates.includes(primary_vote)){/* execute the below code if the quota has been reached or the preferred candidate of the focused voter has been eliminated */
                votes[i].splice(0, 1)/* remove the candidate from their vote */
                primary_vote = focused_vote_object[0]/* switch to their next preferred choice */
                if(primary_totals[primary_vote] != null){/* if the next preferred choice is initialized in the primary_totals object */
                    focused_totals = primary_totals[primary_vote].length/* set their number of votes in the focused_totals variable */
                }else{
                    focused_totals = 0 /* their next preferred choice is uninitialized, set the focused_totals value to be zero */
                }
            }
        }
    
        if(primary_totals[primary_vote] == null){
            primary_totals[primary_vote] = []
            sub_voter_data[primary_vote] = 0
        }/* if uninitialized, initialize the candidates position with an empty array */
        
        primary_totals[primary_vote].push(i)/* push the position of the voter into the candidates array in the primary_totals object */
        sub_voter_data[primary_vote]++/* increment the number of votes they got by one */
    }
    
    for(var e=0; e<candidates.length; e++){
        if(primary_totals[candidates[e]] == null){
            primary_totals[candidates[e]] = []
            sub_voter_data[candidates[e]] = 0
        }
    }/* initialize the canidates who got no votes as empty arrays in their primary_totals  and sub_voter_data positions */

    consensus_snapshots.push(sub_voter_data)/* record the snapshot of the runoff or stage */
    var qualifier_data = get_qualifiers_if_any(primary_totals, quota)/* obtain the candidates that have reached the quota. */
    selected = selected.concat(qualifier_data)/* add the candidates that have reached the quota to the selected candidates array */
    if(selected.length == target_positions){/* if the selected candidates array equals the targeted positions, the consensus process may be concluded */
        console.log(`there are winners! ${selected.toString()}`)
    }
    else if(candidates.length == 2 && target_positions == 1){/* this would only occur if there was an exact tie between two candidates */
        console.log(`there is a tie ${candidates.toString()}`)
        consensus_tie = true;
        tie_breaker = candidates[Math.floor(predefinied_random_value * 2)]
    }
    else{
        /* targeted positions have not been fully filled, so elimination is necessary. */
        eliminate_losers(primary_totals)/* remove a loser and transfer their votes to the remaining candidates */
        calculate_winner()/* restart the calculate_winner process */
    }
}






/* function for validating if all the elements in the first array appear in the second array exactly once */
function allElementsAppearOnce(arr1, arr2) {
    const countMap = {};
    for (const el of arr2) {
        countMap[el] = (countMap[el] || 0) + 1;
    }
    return arr1.every(el => countMap[el] === 1);
}

/* round off a number to at most 6 deimal places */
function round_off(number){
    return (Math.round(number * 1000_000) / 1000_000)
}

/* initializes the voter data */
function initialize_everything(){
    const poll_votes = workerData.poll_votes
    const participants = workerData.static_poll_data.participants
    const registered_voter_data = workerData.file_objects
    const valid_e5s = workerData.static_poll_data.poll_e5s
    const registered_candidates = workerData.static_poll_data.candidates
    const start_time = workerData.static_poll_data.start_time
    const end_time = workerData.static_poll_data.end_time
    const winner_count = workerData.static_poll_data.winner_count
    const randomizer = workerData.static_poll_data.randomizer
    const candiate_ids = []
    const registered_voter_registry = {}
    const participated_voter_registry = {}
    const all_votes = []
    var registered_voter_count = 0

    valid_e5s.forEach(e5 => {
        registered_voter_registry[e5] = []
        participated_voter_registry[e5] = []
    });/* initialize the two values with the valid e5s */

    participants.forEach(participant => {
        if(participant.includes(':')){
            var obj = participant.split(':')
            var participant_e5 = obj[0]/* the first value should be the e5 value */
            var participant_account = obj[1]/* the second should be the account */
            if(valid_e5s.includes(participant_e5) && !isNaN(participant_account) && parseInt(participant_account) < 10**16){/* if the e5 is valid, the account id specified is a number and is less than 10^16 */
                registered_voter_registry[participant_e5].push(participant_account)
            }
        }
    });

    const csv_data = registered_voter_data.csv_files
    const json_data = registered_voter_data.json_files

    /* adds all the registered voters specified in the csv files */
    for(var i=0; i<csv_data.length; i++){
        var csv_file = csv_data[i]
        var final_obj = csv_file['data'].final_obj
        var final_obj_e5_keys = Object.keys(final_obj)
        final_obj_e5_keys.forEach(final_obj_e5 => {
            if(valid_e5s.includes(final_obj_e5)){/* if the e5 specified is valid */
                var registered_final_obj_voters = final_obj[final_obj_e5]
                registered_voter_registry[final_obj_e5] = registered_voter_registry[final_obj_e5].concat(registered_final_obj_voters)/* add all the values to the respective e5 array */
            }
        });
    }

    /* adds all the registered voters specified in the json files */
    for(var j=0; j<json_data.length; j++){
        var json_file = json_data[j]
        var final_obj = json_file['data'].final_obj
        var final_obj_e5_keys = Object.keys(final_obj)
        final_obj_e5_keys.forEach(final_obj_e5 => {
            if(valid_e5s.includes(final_obj_e5)){/* if the e5 specified is valid */
                var registered_final_obj_voters = final_obj[final_obj_e5]
                registered_voter_registry[final_obj_e5] = registered_voter_registry[final_obj_e5].concat(registered_final_obj_voters)/* add all the values to the respective e5 array */
            }
        });
    }

    registered_candidates.forEach(candidate => {
        if(!candiate_ids.includes(candidate['id'])){
            candiate_ids.push(candidate['id'])
        }
    });/* adds all the candidates to the registered candidates array by their id */

    var is_open_vote = true;
    valid_e5s.forEach(e5 => {
        if(registered_voter_registry[e5].length > 0){
            is_open_vote = false
            registered_voter_count += registered_voter_registry[e5].length
        }
    });/* sets the value to false if voters were registered */

    /* add the valid votes in each of the e5s to the all_votes value */
    valid_e5s.forEach(e5 => {
        var e5_votes = poll_votes[e5]/* the votes in the specific e5 in focus */
        if(e5_votes.length > 0){/* if votes exist */
            e5_votes.forEach(event => {/* for each vote event */
                var voter_id = event.returnValues.p2/* sender_acc_id */
                var vote_string = event.returnValues.p4/* string_data */
                var vote_time = event.returnValues.p6/* timestamp */
                if(vote_time > start_time && vote_time < end_time){/* if the vote was cast in the valid period */
                    if(is_open_vote == true || registered_voter_registry[e5].includes(voter_id)){/* if the voter is in the retistry or its an open vote */
                        if(!participated_voter_registry[e5].includes(voter_id)){/* if its the first vote emitted by the voter */
                            participated_voter_registry[e5].push(voter_id)/* record their id to avoid double voting */
                            var voter_array = ''
                            try{
                                voter_array = JSON.parse(vote_string)['e']/* attempt to parse the value */
                            }catch(e){
                                console.log(e)
                            }
                            if(voter_array != '' && voter_array != null && voter_array.length == candiate_ids.length){/* if the value parsed is valid and the array length is valid */
                                if(allElementsAppearOnce(candiate_ids, voter_array) == true){/* if all the required candidates appear in the vote exactly once */
                                    all_votes.push(voter_array)/* record the vote in all votes */
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    registered_voters = registered_voter_count;
    votes = all_votes/* set the valid votes */
    candidates = candiate_ids/* set the candidates */
    target_positions = (!isNaN(winner_count) && parseInt(winner_count) > 0 && parseInt(winner_count) < candiate_ids.length) ? parseInt(winner_count) : 1/* set the targeted candidate winners. If an invalid value is supplied, it will default to 1 */
    predefinied_random_value = (!isNaN(randomizer) && parseFloat(randomizer) < 1 && parseFloat(randomizer) > 0) ? round_off(parseFloat(randomizer)) : 0.53/* set the randomizer value. If an invalid value is passed, it will default to 0.53 */
}

/* starts everything */
function start_counting(){
    initialize_everything()
    calculate_winner()

    return { current_winners: selected, consensus_snapshots, elimination_snapshot, time: Date.now(), consensus_tie, tie_breaker, valid_vote_count: votes.length, registered_voters }
}

const result = start_counting();
parentPort.postMessage(result);/* Send result back to main thread */









