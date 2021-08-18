import axios from 'axios'

 const sendSingleEmail = async(header, body) => {
	let response = await axios.post(`https://962k5qfgt3.execute-api.us-east-1.amazonaws.com/Prod/singleemailcampaign`, 
                                    body, header);
	return response;
}

export default sendSingleEmail