// Configuration - Update these with your Google Sheets details
SHEET_ID = '19CEMvEzzk-hqkjOCmMqZTpPc0pKCHJlPXLZr5zhCwn4'
const CONFIG = {
    // Replace with your Google Sheets CSV export URL
    // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0
    GOOGLE_SHEETS_CSV_URL: 'https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/export?format=csv&gid=0',
    
    // Update with your voting platform URL
    VOTE_URL: 'https://your-voting-platform.com',
    
    // Refresh interval in milliseconds (30 seconds)
    REFRESH_INTERVAL: 30000
};

// Sample candidate profiles (you can customize these)
const CANDIDATE_PROFILES = {
    'Tim': {
        bio: 'Experienced leader with 15 years in public service',
        avatar: 'JS',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Add image URLs
        googleDocUrl: 'https://docs.google.com/document/d/1q449Hx8h0PCPfGUkyZ3m_SoTKN5rVXf9aX58UpyWbpw/edit?tab=t.0'
    },
    'Tom': {
        bio: 'Community organizer focused on education reform',
        avatar: 'SJ',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        googleDocUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID_FOR_SARAH'
    },
    'John': {
        bio: 'Business owner advocating for economic growth',
        avatar: 'MB',
        imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        googleDocUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID_FOR_MIKE'
    },
    'Jane': {
        bio: 'Environmental activist and sustainability expert',
        avatar: 'LD',
        imageUrl: 'https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        googleDocUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID_FOR_LISA'
    }
};

let pollData = [];
let totalVotes = 0;

async function loadPollData() {
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');

    loading.style.display = 'block';
    results.style.display = 'none';
    error.style.display = 'none';

    try {
        // Check if CSV URL is configured
        if (CONFIG.GOOGLE_SHEETS_CSV_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
            throw new Error('Google Sheets URL not configured');
        }

        const response = await fetch(CONFIG.GOOGLE_SHEETS_CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch data');

        const csvText = await response.text();
        const lines = csvText.trim().split('\n');
        
        // Skip header row
        const dataLines = lines.slice(1);
        
        pollData = [];
        totalVotes = 0;

        dataLines.forEach(line => {
            const [candidate, votes] = line.split(',').map(item => item.trim().replace(/"/g, ''));
            if (candidate && votes) {
                const voteCount = parseInt(votes) || 0;
                pollData.push({
                    candidate: candidate,
                    votes: voteCount
                });
                totalVotes += voteCount;
            }
        });

        // Sort by votes (descending)
        pollData.sort((a, b) => b.votes - a.votes);

        displayResults();
        
    } catch (err) {
        console.error('Error loading poll data:', err);
        
        // Show sample data for demonstration
        pollData = [
            { candidate: 'John Smith', votes: 245 },
            { candidate: 'Sarah Johnson', votes: 198 },
            { candidate: 'Mike Brown', votes: 156 },
            { candidate: 'Lisa Davis', votes: 123 }
        ];
        totalVotes = pollData.reduce((sum, item) => sum + item.votes, 0);
        
        displayResults();
        
        // Still show error message
        setTimeout(() => {
            error.style.display = 'block';
        }, 2000);
    }

    loading.style.display = 'none';
    results.style.display = 'block';
}

function getAvatarHTML(profile, candidate) {
    if (profile?.imageUrl) {
        return `<img src="${profile.imageUrl}" alt="${candidate}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    return profile?.avatar || candidate.split(' ').map(n => n[0]).join('');
}

function displayResults() {
    // Update total votes
    document.getElementById('total-count').textContent = totalVotes.toLocaleString();

    // Display candidate results
    const resultsContainer = document.getElementById('candidates-results');
    resultsContainer.innerHTML = '';

    pollData.forEach((candidate, index) => {
        const percentage = totalVotes > 0 ? (candidate.votes / totalVotes * 100).toFixed(1) : 0;
        const profile = CANDIDATE_PROFILES[candidate.candidate];
        const avatarContent = getAvatarHTML(profile, candidate.candidate);

        const candidateCard = document.createElement('div');
        candidateCard.className = 'candidate-card';
        candidateCard.innerHTML = `
            <div class="candidate-header">
                <div class="candidate-avatar">${avatarContent}</div>
                <div class="candidate-info">
                    <h3>${candidate.candidate}</h3>
                    <div class="candidate-votes">${candidate.votes.toLocaleString()} votes</div>
                </div>
            </div>
            <div class="vote-bar">
                <div class="vote-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="vote-percentage">${percentage}%</div>
        `;

        resultsContainer.appendChild(candidateCard);
    });

    // Display candidate profiles
    displayCandidateProfiles();
}

function displayCandidateProfiles() {
    const profilesContainer = document.getElementById('candidate-profiles');
    profilesContainer.innerHTML = '';

    pollData.forEach(candidate => {
        const profile = CANDIDATE_PROFILES[candidate.candidate] || {
            bio: 'Dedicated candidate committed to positive change',
            avatar: candidate.candidate.split(' ').map(n => n[0]).join(''),
            googleDocUrl: '#'
        };
        const avatarContent = getAvatarHTML(profile, candidate.candidate);

        const profileCard = document.createElement('div');
        profileCard.className = 'candidate-profile';
        profileCard.style.cursor = 'pointer';
        profileCard.onclick = function() {
            const url = profile.googleDocUrl;
            if (url === '#' || url.includes('YOUR_GOOGLE_DOC_ID')) {
                alert('Google Doc URL not configured for this candidate yet.');
            } else {
                window.open(url, '_blank');
            }
        };

        profileCard.innerHTML = `
            <div class="candidate-avatar">${avatarContent}</div>
            <h4>${candidate.candidate}</h4>
            <p>${profile.bio.length > 100 ? profile.bio.substring(0, 100) + '...' : profile.bio}</p>
            <div style="margin-top: 15px; color: #667eea; font-weight: 600;">
                Click to view full profile →
            </div>
        `;

        profilesContainer.appendChild(profileCard);
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadPollData();
    setInterval(loadPollData, CONFIG.REFRESH_INTERVAL);
    
    document.querySelector('.vote-button').onclick = function() {
        window.open(CONFIG.VOTE_URL, '_blank');
    };
});

// Keep the card animation code if you want
document.addEventListener('mousemove', function(e) {
    const cards = document.querySelectorAll('.candidate-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        } else {
            card.style.transform = '';
        }
    });
});