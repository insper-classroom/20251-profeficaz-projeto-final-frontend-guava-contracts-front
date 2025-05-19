import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';
import '../styles/Avaliacao.css';

function Avaliacao({ avaliacao }) {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(avaliacao);
    const hasHalfStar = avaliacao % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="star-filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalf key="half-star" className="star-filled" />);
    }

    const emptyStars = 5 - Math.ceil(avaliacao);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-star-${i}`} className="star-empty" />);
    }

    return stars;
  };

  return (
    <div className="stars-container">
      {renderStars()}
    </div>
  );
}

export default Avaliacao;
