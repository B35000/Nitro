async function get_address_prepurchase_balance(){    
    const arg_obj = {
		'address':'0x5d46A8A983871a2e7Db2266385F5ab462d38B0d4',
		'contract_id':1249, 
		'contract_e5':'E35',
	};
	const params = new URLSearchParams(arg_obj);
	const request_url = `https://server.twentythreeinreverse.com/get_address_prepurchase_balance?${params.toString()}`;
	try{
		const response = await fetch(request_url);
		if (!response.ok) {
            console.log(response)
			throw  new  Error(`Failed to retrieve data. Status: ${response}`);
		}
		const data = await response.text();
		const result = JSON.parse(data);
        console.log("result", result)
		if(result.success == true){
			//the call was successful.
			const balance = result.balance // A number
			const logs = result.logs // An array of socket emissions containing all the transactions made by the address.
		}
		else{
			// something went wrong, perhaps invalid fields?
		}
	}
	catch(error){
		// something went wrong.
        console.log("error", error)
	}
}


async function token_price(){
	const starting_time = 0;/* from which date and time the price info is being requested */
	const ending_time = Math.floor(Date.now()/1000)/* to which date and time the price info is being requested */
	const arg_obj = {
		'token_ids':["E35:1130"],/* token ids require at least 2 transactions to be processed. */
		'from':starting_time,
		'to':ending_time
	}
	const params = new URLSearchParams({arg_string: JSON.stringify(arg_obj)});
	const request_url = `https://server.twentythreeinreverse.com/token_price?${params.toString()}`;
	console.log(request_url)
	try{
		const response = await fetch(request_url);
		if (!response.ok) {
            console.log(response)
			throw  new  Error(`Failed to retrieve data. Status: ${response}`);
		}
		const data = await response.text();
		const result = JSON.parse(data);
        console.log("result", result)
		if(result.success == true){
			//the call was successful.
			const my_token = 'E35:1130'
			const my_tokens_data = result[my_token]
			/* 
				my_tokens_data => { 
					'price_change_history':[], ---> Array of Objects containing 'price' and 'time' values
					'total_supply': 3_500_000_000 ---> Supply of token inclusive of auth minted amounts
				} 
			*/
			//process and show data after...
		}
		else{
			// something went wrong, perhaps invalid fields?
		}
	}
	catch(error){
		// something went wrong.
        console.log("error", error)
	}
}

(async () => {
  await token_price();
})();