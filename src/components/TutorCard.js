import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Award, Clock, MapPin } from 'lucide-react';

const TutorCard = ({ tutor }) => {
  const { id, name, avatar, subjects, rating, reviewCount, hourlyRate, location, verified, endorsements } = tutor;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={avatar || `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff`}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
          {verified && (
            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <Award className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <Link to={`/tutor/${id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                {name}
              </h3>
            </Link>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {subjects.slice(0, 3).map((subject, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                >
                  {subject}
                </span>
              ))}
              {subjects.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{subjects.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Available now</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <span className="font-medium">₹{hourlyRate}</span>
                <span className="text-gray-500">/hr</span>
              </div>
              <Link
                to={`/booking/${id}`}
                className="btn-primary text-sm px-3 py-1"
              >
                Book Now
              </Link>
            </div>
          </div>
          
          {endorsements > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award className="h-4 w-4 text-green-600" />
                <span>{endorsements} TA endorsements</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
