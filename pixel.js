document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('player');
  const gameContainer = document.querySelector('.game-container');
  const obstaclesContainer = document.getElementById('obstacles');
  const scoreDisplay = document.getElementById('score'); 
  const popup = document.getElementById('popup');

  let playerX = gameContainer.clientWidth / 2 - player.clientWidth / 2;
  let speed = 40; 
  let isMovingLeft = false;
  let isMovingRight = false;
  let gameOver = false; 
  let isPaused = false; 
  let obstacleInterval; 
  let obstacles = []; 
  let score = 0; 

  function updatePlayerPosition() {
      if (isMovingLeft) {
          playerX -= speed;
          if (playerX < 0) playerX = 0;
      } else if (isMovingRight) {
          playerX += speed;
          if (playerX > gameContainer.clientWidth - player.clientWidth) {
              playerX = gameContainer.clientWidth - player.clientWidth;
          }
      }
      player.style.left = `${playerX}px`;

      if (!gameOver && !isPaused) {
          requestAnimationFrame(updatePlayerPosition);
      }
  }

  function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
          isMovingLeft = true;
      } else if (e.key === 'ArrowRight') {
          isMovingRight = true;
      } else if (e.ctrlKey && e.key === 'r' && gameOver) {
          e.preventDefault(); 
          resetGame();
      } else if (e.key === ' ') {
          togglePause();
      }
  }

  function handleKeyUp(e) {
      if (e.key === 'ArrowLeft') {
          isMovingLeft = false;
      } else if (e.key === 'ArrowRight') {
          isMovingRight = false;
      }
  }

  function togglePause() {
      if (gameOver) return; 

      isPaused = !isPaused;
      if (isPaused) {
          clearInterval(obstacleInterval); 
          obstacles.forEach(obstacle => {
              obstacle.paused = true; 
              cancelAnimationFrame(obstacle.animationFrameId); 
          });
          gameContainer.classList.add('blurred'); 
      } else {
          startObstacleCreation(); 
          obstacles.forEach(obstacle => {
              obstacle.paused = false; 
              moveObstacle(obstacle); 
          });
          updatePlayerPosition(); 
          gameContainer.classList.remove('blurred'); 
      }
  }

  function createObstacle() {
      if (gameOver) return; 

      const obstacle = document.createElement('div');
      obstacle.classList.add('obstacle');

      const size = Math.random() * 50 + 30; 
      obstacle.style.width = `${size}px`;
      obstacle.style.height = `${size}px`;

      const xPos = Math.random() * (gameContainer.clientWidth - size);
      obstacle.style.left = `${xPos}px`;
      obstacle.style.top = `-100px`; 

      obstaclesContainer.appendChild(obstacle);

      const obstacleObject = {
          element: obstacle,
          yPos: -parseFloat(obstacle.style.height),
          speed: 5, 
          paused: false, 
          animationFrameId: null 
      };

      obstacles.push(obstacleObject);
      moveObstacle(obstacleObject);
  }

  function moveObstacle(obstacleObject) {
      function move() {
          if (obstacleObject.paused || gameOver) return; 

          obstacleObject.yPos += obstacleObject.speed;
          obstacleObject.element.style.top = `${obstacleObject.yPos}px`;

          if (isCollision(player, obstacleObject.element)) {
              showGameOverMessage();
              return;
          }

          if (obstacleObject.yPos > gameContainer.clientHeight) {
              obstaclesContainer.removeChild(obstacleObject.element);
              obstacles = obstacles.filter(o => o !== obstacleObject);
              updateScore(10); 
          } else {
              obstacleObject.animationFrameId = requestAnimationFrame(move);
          }
      }
      move();
  }

  function isCollision(player, obstacle) {
      const playerRect = player.getBoundingClientRect();
      const obstacleRect = obstacle.getBoundingClientRect();

      return !(playerRect.right < obstacleRect.left ||
               playerRect.left > obstacleRect.right ||
               playerRect.bottom < obstacleRect.top ||
               playerRect.top > obstacleRect.bottom);
  }

  function resetGame() {
      obstaclesContainer.innerHTML = ''; 
      player.style.left = `${gameContainer.clientWidth / 2 - player.clientWidth / 2}px`;
      player.style.top = `${gameContainer.clientHeight - player.clientHeight - 10}px`;
      gameContainer.classList.remove('blurred'); 
      gameOver = false; 
      obstacles = []; 
      score = 0; 
      updateScore(); 
      startObstacleCreation(); 
      updatePlayerPosition();
  }

  function showGameOverMessage() {
      gameContainer.classList.add('blurred'); 
      popup.classList.remove('hidden'); 
      setTimeout(() => {
          popup.classList.add('hidden');
          resetGame();
      }, 5000);
  }

  function updateScore(points) {
      if (points) {
          score += points;
      }
      scoreDisplay.textContent = `Score: ${score}`;
  }

  function startObstacleCreation() {
      if (!obstacleInterval) {
          obstacleInterval = setInterval(createObstacle, 400);
      }
  }

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);

  startObstacleCreation();
  updatePlayerPosition();
});
