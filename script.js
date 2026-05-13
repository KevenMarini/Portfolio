// Wait for 3 seconds, then hide the loading screen and show the main content
setTimeout(() => {
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('main-content').style.display = 'flex';
  startSkillsCycling();
}, 3000);

const skills = [
  "PCB Design (Learning)",
  "Altium Designer (Learning)",
  "Verilog (Basics)",
  "Python (Fundamental Level)",
  "HTML (Basics)",
  "CSS (Basics)",
  "SQL (Fundamentals)",
  "Java (Basics)",
  "Web Development",
  "JavaScript"
];

let skillsInterval;

function startSkillsCycling() {
  const skillDisplay = document.getElementById('skill-display');
  let currentIndex = 0;
  
  // Show first skill
  skillDisplay.textContent = skills[currentIndex];
  skillDisplay.classList.add('fade-in');
  
  skillsInterval = setInterval(() => {
    currentIndex++;
    if (currentIndex >= skills.length) {
      currentIndex = 0; // Loop back to the start
    }
    
    // Remove class, trigger reflow, add class again to restart animation
    skillDisplay.classList.remove('fade-in');
    void skillDisplay.offsetWidth; 
    skillDisplay.textContent = skills[currentIndex];
    skillDisplay.classList.add('fade-in');
    
  }, 1000);
}

// Enter button logic for the next step
document.getElementById('enter-btn').addEventListener('click', () => {
  // Clear the interval
  clearInterval(skillsInterval);
  
  // Hide intro content
  document.getElementById('main-content').style.display = 'none';
  
  // Update body class for new styling rules
  document.body.className = 'portfolio-mode';
  
  // Show the portfolio
  document.getElementById('portfolio-content').style.display = 'block';
});
