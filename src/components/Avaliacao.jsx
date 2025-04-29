import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

function Avaliacao ({avaliacao}) {
  const stars = [];
  const fullStars = Math.floor(avaliacao);
  const temMeiaEstrela = avaliacao % 1 >= 0.5;

  for (let i=1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="star filled "/>)
    } else if (i === fullStars + 1 && temMeiaEstrela) {
      stars.push(<FaStarHalfAlt key={i} className="star half"/>)
    } else {
      stars.push(<FaRegStar key={i} className="star"/>)
    }
  }

  return (<div className="stars" style={{pointerEvents: "none"}}>{stars}</div>)
}

export default Avaliacao
