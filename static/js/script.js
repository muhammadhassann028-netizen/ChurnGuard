document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('churnForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const resultSection = document.getElementById('resultSection');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
        btnText.textContent = "Analyzing Risk...";
        spinner.classList.remove('hidden');
        
        // Hide previous result if exists
        resultSection.classList.add('hidden');
        resultSection.innerHTML = '';

        try {
            // Fetch API
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'API Error');
            }

            // Render result
            renderResult(result.churn_probability);

        } catch (error) {
            resultSection.innerHTML = `
                <div class="fade-in bg-red-900/40 border border-red-500/50 rounded-2xl p-6 text-white max-w-3xl mx-auto flex items-center gap-4">
                    <svg class="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div>
                        <h4 class="font-bold text-lg">Analysis Failed</h4>
                        <p class="text-red-200 text-sm">${error.message}</p>
                    </div>
                </div>
            `;
            resultSection.classList.remove('hidden');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            btnText.textContent = "Analyze Churn Risk";
            spinner.classList.add('hidden');
            
            // Scroll to results slightly
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });

    function renderResult(prob) {
        const isRisk = prob > 50;
        const probRounded = prob.toFixed(1);
        
        // Dynamic Classes
        const cardClass = isRisk ? 'card-risk' : 'card-safe';
        const titleText = isRisk ? 'CRITICAL RISK' : 'SAFE / LOYAL CUSTOMER';
        const statusBadge = isRisk 
            ? '<span class="bg-red-500/20 text-red-100 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30">Action Required</span>'
            : '<span class="bg-emerald-500/20 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">Healthy Account</span>';
        
        // SVG Circle properties
        const radius = 46;
        const circumference = 2 * Math.PI * radius; // ~289.02
        const strokeDashoffset = circumference - (prob / 100) * circumference;
        
        // Advice
        const adviceHtml = isRisk ? `
            <div class="mt-5 bg-black/20 rounded-xl p-5 border border-white/5">
                <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Strategic Retention Recommendations
                </h4>
                <ul class="space-y-2 text-red-50 text-sm font-medium">
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0"></div>
                        Offer a personalized retention discount on their current plan immediately.
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0"></div>
                        Initiate a direct courtesy call to discuss and resolve pain points.
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0"></div>
                        Propose a favorable long-term contract lock-in with bundled perks.
                    </li>
                </ul>
            </div>
        ` : `
            <div class="mt-5 bg-black/20 rounded-xl p-5 border border-white/5">
                <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Standard Nurturing Advice
                </h4>
                <ul class="space-y-2 text-emerald-50 text-sm font-medium">
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0"></div>
                        Send an automated thank-you email acknowledging their loyalty.
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0"></div>
                        Target with upsell campaigns for premium features or add-ons.
                    </li>
                    <li class="flex items-start gap-2">
                        <div class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0"></div>
                        Request a customer review or introduce a referral program.
                    </li>
                </ul>
            </div>
        `;

        const html = `
            <div class="${cardClass} rounded-3xl p-8 text-white fade-in flex flex-col md:flex-row items-center md:items-stretch gap-8 w-full max-w-4xl mx-auto relative overflow-hidden">
                
                <!-- Background ambient glow inside card -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <!-- Circular Progress -->
                <div class="flex-shrink-0 relative flex items-center justify-center pt-2">
                    <svg class="w-40 h-40 drop-shadow-xl" viewBox="0 0 100 100">
                        <circle class="text-black/20 stroke-current" stroke-width="8" cx="50" cy="50" r="${radius}" fill="transparent"></circle>
                        <circle class="text-white stroke-current progress-ring__circle" stroke-width="8" stroke-linecap="round" cx="50" cy="50" r="${radius}" fill="transparent" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center pt-2">
                        <span class="text-4xl font-extrabold tracking-tighter">${probRounded}<span class="text-2xl">%</span></span>
                        <span class="text-[10px] uppercase tracking-widest opacity-70 mt-1 font-bold">Churn Prob</span>
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-grow flex flex-col justify-center relative z-10 w-full">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="uppercase tracking-widest text-xs font-black opacity-70">Analysis Result</div>
                        ${statusBadge}
                    </div>
                    <h3 class="text-3xl md:text-4xl font-extrabold mb-1 tracking-tight">${titleText}</h3>
                    
                    ${adviceHtml}
                </div>
            </div>
        `;

        resultSection.innerHTML = html;
        resultSection.classList.remove('hidden');

        // Trigger SVG animation after a tiny delay for DOM to paint
        requestAnimationFrame(() => {
            setTimeout(() => {
                const circle = resultSection.querySelector('.progress-ring__circle');
                if (circle) {
                    circle.style.strokeDashoffset = strokeDashoffset;
                }
            }, 50);
        });
    }
});
