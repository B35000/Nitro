import { Worker } from "worker_threads";

function runPollVoteCounterWorker(data) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./polls.cjs', {
            workerData: data
        });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
        if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}


async function run_poll_worker(poll_votes, static_poll_data, file_objects, voter_weights){
    return await runPollVoteCounterWorker({poll_votes, static_poll_data, file_objects, voter_weights})
}


export { run_poll_worker };

