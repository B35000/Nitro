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
var consensus_snapshots = []

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

function select_tie_breaker(unfortunate_candidates){
    if(unfortunate_candidates.length == 1) return 0
	var pos = -1
    var e = 0
    var selected_candidates = unfortunate_candidates.slice()
    while(pos == -1){
        if(consensus_snapshots.length > 0 && consensus_snapshots.length > e){
            var focused_snapshot = consensus_snapshots[e]
            var arr = []
            selected_candidates.forEach(unfortunate_candid => {
                arr.push(focused_snapshot[unfortunate_candid].length)
                });
            const maxValue = Math.max(...arr)
            const positions = arr.reduce((acc, val, index) => {
                if (val === maxValue) acc.push(index);
                return acc;
            }, []);
            if(positions.length < selected_candidates.length){
                positions.forEach(position => {
                    selected_candidates.splice(position, 1)
                });
                if(selected_candidates.length == 1){
                    pos = selected_candidates[0]
                }else{
                    e++
                }
            }else{
                e++
            }
        }else{
            pos = Math.floor(Math.random() * selected_candidates.length)
        }
    }
    
    var selected_c = selected_candidates[pos]
    return unfortunate_candidates.indexOf(selected_c)
}

function eliminate_losers(primary_totals){
    // Step 1: Find the minimum array length
    const minLength = Math.min(...Object.values(primary_totals).map(arr => arr.length));
    // Step 2: Filter entries with that length
    const result = Object.entries(primary_totals)
        .filter(([_, arr]) => arr.length === minLength)
        .map(([key]) => key);
 
 	var candidate = result[select_tie_breaker(result)]
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
    }

    for(var e=0; e<candidates.length; e++){
        if(primary_totals[candidates[e]] == null){
        primary_totals[candidates[e]] = []
        }
    }
    consensus_snapshots.push(primary_totals)
    var majority_proportion = get_majority_proportion(primary_totals, total_vote_count)
    if(majority_proportion[0] < 0.5 && majority_proportion[1].length > 2){
        //runoff is required
        eliminate_losers(primary_totals)
        calculate_winner()
    }
    else if(majority_proportion[0] == 0.5 && majority_proportion[1].length == 2){
        console.log(`tie between ${majority_proportion[1].toString()}`)
    }else{
        console.log(`there is a winner! ${majority_proportion[1].toString()}`)
    }
}


calculate_winner()





















