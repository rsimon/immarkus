import { ServiceConfig } from '@/services/Types';

export const config: ServiceConfig = {
  id: 'google-vision',
  connector: 'google-vision',
  displayName: 'Google Vision',
  description: 'OCR via the Google Cloud Vision API',
  requiresKey: true,
  parameters: [{
    type: 'api_key',
    id: 'api-key',
    displayName: 'Your API Key',
    required: true
  }],
  keyInstructions: `
You need an API key to use Google Vision. Note that Google Vision is a **paid service**!

To get your own key:
- [Start here](https://cloud.google.com/vision/docs/before-you-begin) and create a new project
- Choose **Billing** from the sidebar
- Choose **Enable billing account** and fill your payment information
- Go to **APIs & Services** > **Enabled APIs & Services** and enable the Google Cloud Vision API
- Go to **APIs & Services** > **Credentials** 
- Choose **Create Credentials** > **API key** from the menu to create a key
`.trim()
};