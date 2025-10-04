const xhr = new XMLHttpRequest();
const element = document.getElementById('myDiv');

if ('IdleDetector' in window) {
  new IdleDetector();
}
