var votes = [
	['green', 'red', 'blue'],
    ['green', 'red', 'blue'],
    ['green', 'blue', 'red'],
    ['green', 'red', 'blue'],
    ['blue', 'red', 'green'],
    ['blue', 'green', 'red'],
    ['red', 'blue', 'green'],
    ['red', 'green', 'blue'],
    ['red', 'blue', 'green'],
]
//bun

var candidates = ['green', 'red', 'blue']

function get_majority_proportion(primary_totals, total_vote_count){
    // Step 1: Find the minimum array length
    const maxLength = Math.max(...Object.values(primary_totals).map(arr => arr.length));
    // Step 2: Filter entries with that length
    const result = Object.entries(primary_totals)
        .filter(([_, arr]) => arr.length === maxLength)
        .map(([key]) => key);
        
    const candidate_proportion = primary_totals[result[0]] / total_vote_count
    return [candidate_proportion, result]
}

function eliminate_losers(primary_totals, secondary_totals){
    // Step 1: Find the minimum array length
    const minLength = Math.min(...Object.values(primary_totals).map(arr => arr.length));
    // Step 2: Filter entries with that length
    const result = Object.entries(primary_totals)
        .filter(([_, arr]) => arr.length === minLength)
        .map(([key]) => key);
 
 	var candidate = result[Math.floor(Math.random() * result.length)]
    const their_voters = primary_totals[candidate]
    their_voters.forEach(voter => {
        votes[voter].splice(0, 1)
    });
    const index = candidates.indexOf(candidate)
    if(index != -1){
        candidates.splice(index, 1)
    }
}

function calculate_winner(){
	const primary_totals = {}
    const secondary_totals = {}
    const total_vote_count = votes.length
    
    for(var i=0; i<votes.length; i++){
        var focused_vote_object = votes[i]
        var primary_vote = focused_vote_object[0]
        while(!candidates.includes(primary_vote)){
            votes[i].splice(0, 1)
            primary_vote = focused_vote_object[0]
        }
    
        if(primary_totals[primary_vote] == null){
        primary_totals[primary_vote] = []
        }
        primary_totals[primary_vote].push(i)
        
        var secondary_vote = focused_vote_object[1]
        while(secondary_vote != null && !candidates.includes(secondary_vote)){
        votes[i].splice(1, 1)
        secondary_vote = focused_vote_object[1]
        }
        if(secondary_vote != null){
        if(secondary_totals[secondary_vote] == null){
            secondary_totals[secondary_vote] = []
        }
        secondary_totals[secondary_vote].push(i)
        }
    }

    for(var e=0; e<candidates.length; e++){
        if(primary_totals[candidates[e]] == null){
        primary_totals[candidates[e]] = []
        }
        if(secondary_totals[candidates[e]] == null){
            secondary_totals[candidates[e]] = []
        }
    }

    var majority_proportion = get_majority_proportion(primary_totals, total_vote_count)
    if(majority_proportion[0] < 0.5 && majority_proportion[1].length > 2){
        //runoff is required
        eliminate_losers(primary_totals, secondary_totals)
        calculate_winner()
    }
    else if(majority_proportion[0] == 0.5 && majority_proportion[1].length == 2){
        console.log(`tie between ${majority_proportion[1].toString()}`)
    }else{
        console.log(`there is a winner! ${majority_proportion[1].toString()}`)
    }
}


calculate_winner()





















