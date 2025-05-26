import { run_poll_worker } from "../test_runner.js";
import { describe, it } from "node:test";
import assert from "node:assert";

const votes = [
	['green', 'yellow', 'blue', 'red'],
    ['green', 'red', 'blue', 'yellow'],
    ['green', 'blue', 'red', 'yellow'],
    ['green', 'red', 'yellow', 'blue'],
    ['blue', 'yellow', 'red', 'green'],
    ['blue', 'green', 'red', 'yellow'],
    ['yellow', 'red', 'blue', 'green'],
    ['red', 'green', 'yellow', 'blue'],
    ['red', 'yellow', 'blue', 'green'],
    ['yellow', 'red', 'blue', 'green'],
    ['blue', 'yellow', 'red', 'green'],
    ['yellow', 'red', 'blue', 'green'],
    ['red', 'yellow', 'green', 'blue'],
    ['yellow', 'blue', 'red', 'green'],
]

const candidates = [{'id':'green'}, {'id':'red'}, {'id':'blue'}, {'id':'yellow'}]

describe("instant-runoff elections", () => {
  it.skip('1. Should run tests properly', async () => {
    assert.strictEqual('abc', "abc");
    assert.strictEqual('123', "123");
    assert.notEqual('do-re', 'mi')
  });

  it.skip('2. Should run basic vote count successfully (1 vote, 1 registered voter, 1 winner -> green, )', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'green');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 1);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 0);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 1);
    assert.equal(registered_voters, 1);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('3. Should run basic vote count successfully (1 vote, 1 registered voter, 1 winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 1);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 1);
    assert.equal(registered_voters, 1);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('4. Should run basic vote count successfully (2 votes, 2 registered voters, 1 winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 2);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('5. Should run basic vote count successfully (3 votes, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('6. Should run basic vote count successfully (3 votes, 3 registered voters, 1 winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 1);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('7. Should run basic vote count successfully (2 votes, 2 registered voters, 1 winner via tie breacker -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots
    var tied_candidates = test_results.tied_candidates

    // console.log('data', test_results)
    assert.equal(current_winners.length, 0);
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 1);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 1);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, true);
    assert.equal(tie_breaker, 'green');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 2);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
    assert.equal(tied_candidates.length, 2)
  });

  it.skip('8. Should run basic vote count successfully (3 votes, 3 registered voters, 1 winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['red', 'yellow', 'green', 'blue']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 3);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(elimination_snapshot.length, 2);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 2);
    assert.equal(vote_donation_snapshots.length, 3);
  });

  it.skip('9. Should run basic vote count successfully (14 votes, 14 registered voters, 1 winner -> green)', async () => {
    var poll_votes = {
        'E25': []
    }
    var participants = []
    votes.forEach((vote, index) => {
        var acc = 1002+index
        poll_votes['E25'].push({ returnValues: {p2: acc, p4: JSON.stringify({'e': vote}), p6:1000} })
        participants.push('E25:'+ acc)
    });
    var static_poll_data = { 
        participants, 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    

    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 14);
    assert.equal(registered_voters, 14);
  });

  it.skip('10. Should run basic vote count successfully (3 votes, 2 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 2);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('11. Should run basic vote count successfully (3 votes, 3 registered voters (3 in 1 csv file), 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: [], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[{'data':{final_obj:{'E25':[1002, 1003, 1004]}}}], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('12. Should run basic vote count successfully (3 votes, 3 registered voters (3 in 1 json file), 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: [], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[],
        json_files:[{'data':{final_obj:{'E25':[1002, 1003, 1004]}}}] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('13. Should run basic vote count successfully (3 votes, 3 registered voters (3 in 1 csv file and 1 json file), 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: [], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[{'data':{final_obj:{'E25':[1002, 1003]}}}],
        json_files:[{'data':{final_obj:{'E25':[1004]}}}] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('14. Should run basic vote count successfully (3 votes, 3 registered voters (3 in 3 csv files), 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: [], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1,
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[
            {'data':{final_obj:{'E25':[1002]}}}, 
            {'data':{final_obj:{'E25':[1003]}}}, 
            {'data':{final_obj:{'E25':[1004]}}}
        ],
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('15. Should run basic vote count successfully (3 votes, 1 invalid vote time, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:2000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1500,
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('16. Should run basic vote count successfully (3 votes, 1 invalid revote, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1001 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('17. Should run basic vote count successfully (3 votes, 1 valid revote, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1001 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:true, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 1);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('18. Should run basic vote count successfully (3 votes, 1 invalid vote time, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:99 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 100,
        end_time:1500,
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('19. Should run basic vote count successfully (3 votes, 1 malformed vote, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'g', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('20. Should run basic vote count successfully (3 votes, 1 malformed vote, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('21. Should run basic vote count successfully (3 votes, 1 malformed vote, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: 'malformed', p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 2);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 2);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });

  it.skip('22. Should run basic vote count successfully (3 votes, 1 invalid E5 used, 3 registered voters, 1 unanimous winner -> yellow)', async () => {
    var poll_votes = {
        'E25': [
            { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
            { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ],
        'E35':[
            { returnValues: { p2: 1005, p4: JSON.stringify({'e': ['yellow', 'green', 'blue', 'red']}), p6:1000 } },
        ]
    }
    var static_poll_data = { 
        participants: ['E25:1002', 'E25:1003', 'E25:1004', 'E35:1005'], 
        poll_e5s:['E25'], 
        candidates: candidates, 
        start_time: 1,
        end_time:1_000_000_000, 
        winner_count:1, 
        randomizer:0.53, 
        change_vote_enabled:false, 
    }
    var file_objects = { 
        csv_files:[], 
        json_files:[] 
    }
    
    var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
    var current_winners = test_results.current_winners
    var consensus_snapshots = test_results.consensus_snapshots
    var elimination_snapshot = test_results.elimination_snapshot
    var consensus_tie = test_results.consensus_tie
    var tie_breaker = test_results.tie_breaker
    var valid_vote_count = test_results.valid_vote_count
    var registered_voters = test_results.registered_voters
    var vote_transfer_snapshots = test_results.vote_transfer_snapshots
    var vote_donation_snapshots = test_results.vote_donation_snapshots

    // console.log('data', test_results)
    assert.equal(current_winners.length, 1);
    assert.equal(current_winners[0], 'yellow');
    assert.equal(consensus_snapshots.length, 1);
    assert.equal(Object.keys(consensus_snapshots[0]).length, candidates.length);
    assert.equal(consensus_snapshots[0]['green'], 0);
    assert.equal(consensus_snapshots[0]['red'], 0);
    assert.equal(consensus_snapshots[0]['blue'], 0);
    assert.equal(consensus_snapshots[0]['yellow'], 3);
    assert.equal(elimination_snapshot.length, 0);
    assert.equal(consensus_tie, false);
    assert.equal(tie_breaker, '');
    assert.equal(valid_vote_count, 3);
    assert.equal(registered_voters, 3);
    assert.equal(vote_transfer_snapshots.length, 0);
    assert.equal(vote_donation_snapshots.length, 1);
  });
});

describe("propotinal-ranked choice elections", () => {
    it.skip('1. Should run basic vote count successfully (1 vote, 1 registered voter, inconclusive_ballot )', async () => {
        var poll_votes = {
            'E25': [
                { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
            ]
        }
        var static_poll_data = { 
            participants: ['E25:1002'], 
            poll_e5s:['E25'], 
            candidates: candidates, 
            start_time: 1,
            end_time:1_000_000_000, 
            winner_count:2, 
            randomizer:0.53, 
            change_vote_enabled:false, 
        }
        var file_objects = { 
            csv_files:[], 
            json_files:[] 
        }
        
        var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
        var current_winners = test_results.current_winners
        var consensus_snapshots = test_results.consensus_snapshots
        var elimination_snapshot = test_results.elimination_snapshot
        var consensus_tie = test_results.consensus_tie
        var tie_breaker = test_results.tie_breaker
        var valid_vote_count = test_results.valid_vote_count
        var registered_voters = test_results.registered_voters
        var vote_transfer_snapshots = test_results.vote_transfer_snapshots
        var vote_donation_snapshots = test_results.vote_donation_snapshots
        var inconclusive_ballot = test_results.inconclusive_ballot
    
        // console.log('data', test_results)
        assert.equal(current_winners.length, 0);
        assert.equal(consensus_snapshots.length, 0);
        assert.equal(elimination_snapshot.length, 0);
        assert.equal(consensus_tie, false);
        assert.equal(tie_breaker, '');
        assert.equal(valid_vote_count, 1);
        assert.equal(registered_voters, 1);
        assert.equal(vote_transfer_snapshots.length, 0);
        assert.equal(vote_donation_snapshots.length, 0);
        assert.equal(inconclusive_ballot, true)
    });

    it.skip('2. Should run basic vote count successfully (4 votes, 4 registered voters, 2 targeted winners -> green and yellow )', async () => {
        var poll_votes = {
            'E25': [
                { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
                { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
                { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
                { returnValues: { p2: 1005, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
            ]
        }
        var static_poll_data = { 
            participants: ['E25:1002', 'E25:1003', 'E25:1004', 'E25:1005'], 
            poll_e5s:['E25'], 
            candidates: candidates, 
            start_time: 1,
            end_time:1_000_000_000, 
            winner_count:2, 
            randomizer:0.53, 
            change_vote_enabled:false, 
        }
        var file_objects = { 
            csv_files:[], 
            json_files:[] 
        }
        
        var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
        var current_winners = test_results.current_winners
        var consensus_snapshots = test_results.consensus_snapshots
        var elimination_snapshot = test_results.elimination_snapshot
        var consensus_tie = test_results.consensus_tie
        var tie_breaker = test_results.tie_breaker
        var valid_vote_count = test_results.valid_vote_count
        var registered_voters = test_results.registered_voters
        var vote_transfer_snapshots = test_results.vote_transfer_snapshots
        var vote_donation_snapshots = test_results.vote_donation_snapshots
        var inconclusive_ballot = test_results.inconclusive_ballot
    
        // console.log('data', test_results)
        assert.equal(current_winners.length, 2);
        assert.equal(current_winners[0], 'green');
        assert.equal(current_winners[1], 'yellow');
        assert.equal(consensus_snapshots.length, 1);
        assert.equal(elimination_snapshot.length, 0);
        assert.equal(consensus_tie, false);
        assert.equal(tie_breaker, '');
        assert.equal(valid_vote_count, 4);
        assert.equal(registered_voters, 4);
        assert.equal(vote_transfer_snapshots.length, 0);
        assert.equal(vote_donation_snapshots.length, 1);
        assert.equal(inconclusive_ballot, false)
    });

    it.skip('3. Should run basic vote count successfully (4 votes, 4 registered voters, 2 targeted winners -> green and blue )', async () => {
        var poll_votes = {
            'E25': [
                { returnValues: { p2: 1002, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
                { returnValues: { p2: 1003, p4: JSON.stringify({'e': ['green', 'yellow', 'blue', 'red']}), p6:1000 } },
                { returnValues: { p2: 1004, p4: JSON.stringify({'e': ['green', 'blue', 'yellow',  'red']}), p6:1000 } },
                { returnValues: { p2: 1005, p4: JSON.stringify({'e': ['green','blue', 'yellow',  'red']}), p6:1000 } },
            ]
        }
        var static_poll_data = { 
            participants: ['E25:1002', 'E25:1003', 'E25:1004', 'E25:1005'], 
            poll_e5s:['E25'], 
            candidates: candidates, 
            start_time: 1,
            end_time:1_000_000_000, 
            winner_count:2, 
            randomizer:0.53, 
            change_vote_enabled:false, 
        }
        var file_objects = { 
            csv_files:[], 
            json_files:[] 
        }
        
        var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
        var current_winners = test_results.current_winners
        var consensus_snapshots = test_results.consensus_snapshots
        var elimination_snapshot = test_results.elimination_snapshot
        var consensus_tie = test_results.consensus_tie
        var tie_breaker = test_results.tie_breaker
        var valid_vote_count = test_results.valid_vote_count
        var registered_voters = test_results.registered_voters
        var vote_transfer_snapshots = test_results.vote_transfer_snapshots
        var vote_donation_snapshots = test_results.vote_donation_snapshots
        var inconclusive_ballot = test_results.inconclusive_ballot
    
        // console.log('data', test_results)
        assert.equal(current_winners.length, 2);
        assert.equal(current_winners[0], 'green');
        assert.equal(current_winners[1], 'blue');
        assert.equal(consensus_snapshots.length, 1);
        assert.equal(elimination_snapshot.length, 0);
        assert.equal(consensus_tie, false);
        assert.equal(tie_breaker, '');
        assert.equal(valid_vote_count, 4);
        assert.equal(registered_voters, 4);
        assert.equal(vote_transfer_snapshots.length, 0);
        assert.equal(vote_donation_snapshots.length, 1);
        assert.equal(inconclusive_ballot, false)
    });

    it.skip('4. Should run basic vote count successfully (14 votes, 14 registered voters, 2 winners -> green and yellow)', async () => {
        var poll_votes = {
            'E25': []
        }
        var participants = []
        votes.forEach((vote, index) => {
            var acc = 1002+index
            poll_votes['E25'].push({ returnValues: {p2: acc, p4: JSON.stringify({'e': vote}), p6:1000} })
            participants.push('E25:'+ acc)
        });
        var static_poll_data = { 
            participants, 
            poll_e5s:['E25'], 
            candidates: candidates, 
            start_time: 1,
            end_time:1_000_000_000, 
            winner_count:2, 
            randomizer:0.53, 
            change_vote_enabled:false, 
        }
        var file_objects = { 
            csv_files:[], 
            json_files:[] 
        }
        
    
        var test_results = await run_poll_worker(poll_votes, static_poll_data, file_objects)
        var current_winners = test_results.current_winners
        var consensus_tie = test_results.consensus_tie
        var tie_breaker = test_results.tie_breaker
        var valid_vote_count = test_results.valid_vote_count
        var registered_voters = test_results.registered_voters
    
        // console.log('data', test_results)
        assert.equal(current_winners.length, 2);
        assert.equal(current_winners[0], 'green');
        assert.equal(current_winners[1], 'yellow');
        assert.equal(consensus_tie, false);
        assert.equal(tie_breaker, '');
        assert.equal(valid_vote_count, 14);
        assert.equal(registered_voters, 14);
    });
});