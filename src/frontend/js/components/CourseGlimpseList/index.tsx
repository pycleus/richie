import { defineMessages, FormattedMessage } from 'react-intl';

import { APIResponseListMeta } from 'types/api';
import { CommonDataProps } from 'types/commonDataProps';
import { CourseGlimpse, CourseGlimpseCourse } from 'components/CourseGlimpse';

const messages = defineMessages({
  courseCount: {
    defaultMessage:
      'Showing {start, number} to {end, number} of {courseCount, number} {courseCount, plural, one {course} other {courses}} matching your search',
    description:
      'Result count & pagination information for course search. Appears right above search results',
    id: 'components.CourseGlimpseList.courseCount',
  },
  offscreenCourseCount: {
    defaultMessage:
      '{courseCount, number} {courseCount, plural, one {course} other {courses}} matching your search',
    description: 'Short result count information for course search. Only for screen readers',
    id: 'components.CourseGlimpseList.offscreenCourseCount',
  },
});

interface CourseGlimpseListProps {
  courses: CourseGlimpseCourse[];
  meta?: APIResponseListMeta;
  className?: string;
}

export const CourseGlimpseList = ({
  context,
  courses,
  meta,
  className,
}: CourseGlimpseListProps & CommonDataProps) => {
  const containerClassnames = ['course-glimpse-list'];
  if (className) {
    containerClassnames.push(className);
  }

  return (
    <div className={containerClassnames.join(' ')}>
      {meta && (
        <div className="course-glimpse-list__header">
          <div
            className="offscreen"
            data-testid="course-glimpse-sr-count"
            aria-live="polite"
            aria-atomic="true"
          >
            <FormattedMessage
              {...messages.offscreenCourseCount}
              values={{
                courseCount: meta.total_count,
              }}
            />
          </div>
          <div className="course-glimpse-list__count" aria-hidden="true">
            <FormattedMessage
              {...messages.courseCount}
              values={{
                courseCount: meta.total_count,
                end: meta.offset + meta.count,
                start: meta.offset + 1,
              }}
            />
          </div>
        </div>
      )}
      <div className="course-glimpse-list__content">
        {courses.map((course) => (
          <CourseGlimpse context={context} course={course} key={course.code} />
        ))}
      </div>
    </div>
  );
};

export { getCourseGlimpsListProps } from './utils';
