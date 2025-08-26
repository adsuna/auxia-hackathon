import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star } from 'lucide-react';

const TopicCard = ({ topic }) => {
  const { id, name, description, tutorCount, rating, color } = topic;

  return (
    <Link to={`/browse?topic=${id}`} className="block">
      <div className="card hover:shadow-md transition-shadow duration-200 group">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {name}
            </h3>
            <p className="text-gray-600 text-sm mt-1">{description}</p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{tutorCount} tutors</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
