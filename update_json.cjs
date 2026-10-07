const fs = require('fs');
const data = JSON.parse(fs.readFileSync('chatbot.json', 'utf8'));

data.chatbot_intents.push(
  {
    intent: 'who_created_you',
    example_queries: ['who created you', 'who made you', 'who is your creator', 'who built you'],
    response_type: 'static',
    sample_response: 'I was created by chaitu to help provide safe home-care guidance.'
  },
  {
    intent: 'developer_info',
    example_queries: ['who is chaitu', 'tell me about chaitu'],
    response_type: 'static',
    sample_response: 'Chaitu is my developer! They built this home-care guidance app to help people manage minor symptoms.'
  },
  {
    intent: 'website_purpose',
    example_queries: ['what is CareGuide', 'what is this website', 'tell me about this website'],
    response_type: 'static',
    sample_response: 'CareGuide is a platform designed to offer quick, reliable home-care tips for non-urgent symptoms, though it is always best to consult a doctor for medical advice.'
  }
);

fs.writeFileSync('chatbot.json', JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated chatbot.json');
