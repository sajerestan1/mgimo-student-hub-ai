# Enable AI on the StudentLife preview

StudentLife uses an OpenAI-compatible HTTPS chat-completions endpoint. Provider credentials stay on the server. The app does not send questions or academic records while the provider is unconfigured.

## Free-tier setup with Groq

1. Create a Groq account and API key at https://console.groq.com/keys. Keep the key private. Do not upgrade or add billing details if you intend to stay on the free tier. Check Groq's current model and free-tier limits before choosing a model.
2. In cPanel File Manager, open `/home/buildfor/`, which is above the preview site's document root.
3. Create a file named `studentlife-ai-secrets.php` with this content:

```php
<?php
return [
    'endpoint' => 'https://api.groq.com/openai/v1/chat/completions',
    'api_key' => 'PASTE_YOUR_GROQ_API_KEY_HERE',
    'model' => 'openai/gpt-oss-20b',
];
```

4. Replace the placeholder with your Groq API key. Save the file and set its permissions to `0600` if cPanel offers that option. Keep it outside `preview.studentlife.buildforge.com.ng`'s document root, and do not upload it to GitHub.
5. Reload StudentLife's AI Study Companion. The status should change from **AI NOT CONNECTED** to **PROVIDER CONFIGURED**. Send a basic test question.

The app can also use the server environment variables `STUDENTLIFE_AI_ENDPOINT`, `STUDENTLIFE_AI_API_KEY`, and `STUDENTLIFE_AI_MODEL`. Environment values take precedence over the protected PHP file.

## If it still says unavailable

Check that the file is exactly at `/home/buildfor/studentlife-ai-secrets.php`, PHP can read it, and the file returns an array with all three values. Check the endpoint, model availability and key in the provider dashboard. If the hosting account uses a different home directory, put the file one directory above the preview document root.

## Student record privacy

Once enabled, the student's question and the academic context authorized for that role are sent to the chosen provider. Groq documents that inference data is not retained by default, though some data may be temporarily logged for reliability or abuse monitoring. Review Groq's data controls and your school's policy before using real student records. Consider enabling Zero Data Retention in Groq's Data Controls.

Provider references:
- OpenAI-compatible API: https://console.groq.com/docs/openai
- Models and availability: https://console.groq.com/docs/models
- Free-tier limits and billing: https://console.groq.com/docs/billing-faqs
- Data handling: https://console.groq.com/docs/your-data
