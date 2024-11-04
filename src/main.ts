// todo
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const uselessButton = document.createElement("button");
uselessButton.innerHTML = "Click me";
uselessButton.addEventListener("click", () => {
  alert("You clicked the button");
});
app.append(uselessButton);
