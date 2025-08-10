document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const ctDateInput = document.getElementById('ctDate');
    const drugNameInput = document.getElementById('drugName');
    const calculateBtn = document.getElementById('calculateBtn');
    const drugHolidayInfo = document.getElementById('drugHolidayInfo');
    const difyResponseContent = document.getElementById('difyResponseContent');

    // Set today's date as default for convenience
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    ctDateInput.value = `${year}-${month}-${day}`;
    console.log(`Default CT Date set to: ${ctDateInput.value}`);

    calculateBtn.addEventListener('click', async () => {
        console.log('Calculate button clicked');
        const ctDateStr = ctDateInput.value;

        if (!ctDateStr) {
            alert('CT検査日を入力してください。');
            console.warn('CT Date not entered.');
            return;
        }

        const ctDate = new Date(ctDateStr);
        console.log(`CT Date selected: ${ctDate.toDateString()}`);

        // Calculate 48 hours before and after
        const stopDate = new Date(ctDate.getTime() - (48 * 60 * 60 * 1000));
        const resumeDate = new Date(ctDate.getTime() + (48 * 60 * 60 * 1000));

        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const h = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            return `${y}年${m}月${d}日 ${h}時${min}分`;
        };

        const infoText = `ビグアナイド系薬の休薬指示:
CT検査日: ${formatDate(ctDate)}
中止開始日時: ${formatDate(stopDate)}
再開日時: ${formatDate(resumeDate)}
※検査前後48時間の休薬が必要です。`;
        drugHolidayInfo.textContent = infoText;
        console.log('Drug holiday info displayed:', infoText);

        // Dify Webhook Integration
        difyResponseContent.textContent = ''; // Clear previous results
        console.log('Clearing previous Dify responses.');

        const difyApiUrl = 'https://api.dify.ai/v1/workflows/run';
        const difyApiKey = 'app-yAKYKZKeWZtzhBB9hagJRjpC'; // This should ideally be handled more securely in a real app

        // Format date for Dify API (YYYY/MM/DD)
        const opeDayFormatted = `${ctDate.getFullYear()}/${String(ctDate.getMonth() + 1).padStart(2, '0')}/${String(ctDate.getDate()).padStart(2, '0')}`;
        console.log(`Formatted operation day for Dify: ${opeDayFormatted}`);

        const drugName = drugNameInput.value;
        console.log(`Drug Name entered: ${drugName}`);

        const requestBody = {
            inputs: {
                drug_name: drugName,
                test_day: opeDayFormatted
            },
            response_mode: 'blocking',
            user: 'test-user-123' // Example user ID
        };
        console.log('Dify request body:', requestBody);

        try {
            const response = await fetch(difyApiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${difyApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Dify API response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Dify API error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Dify API full response data:', data);

            // Assuming Dify returns a 'text' field in its result or similar
            // You might need to adjust this based on actual Dify workflow output
            const difyTextResponse = data.outputs ? data.outputs.text : 'Difyからの応答がありませんでした。';
            console.log('Dify text response extracted:', difyTextResponse);

            if (difyTextResponse) {
                difyResponseContent.textContent = difyTextResponse;
            } else {
                difyResponseContent.textContent = 'Difyからの応答がありませんでした。';
            }

        } catch (error) {
            console.error('Error calling Dify API:', error);
            difyResponseContent.textContent = `Dify API呼び出し中にエラーが発生しました: ${error.message}`;
        }
    });
});