'use strict'
import React from 'react'
import PropTypes from 'prop-types'
import Title from '~/components/ui/Title'
import typographyStyles from '~/styles/Typography.module.css'
import commonStyles from '~/styles/CommonStyles.module.css'
import styles from './TopContent.module.css'
import { OPACITY_30, WHITE, SMALL } from '@platformatic/ui-components/src/components/constants'
import { VerticalSeparator, Icons } from '@platformatic/ui-components'

function TopContent ({ runningApps, stoppedApps }) {
  return (
    <div className={`${styles.container} ${commonStyles.mediumFlexBlock}`}>
      <Title
        title='Recent Apps'
        iconName='RecentAppsIcon'
        dataAttrName='cy'
        dataAttrValue='recent-apps-title'
      />
      <p className={`${typographyStyles.desktopBodyLarge} ${typographyStyles.textWhite} ${typographyStyles.opacity70}`}>
        Manage all your applications. You can create or import existing applications anytime.
      </p>
      <div className={styles.content}>
        <div className={styles.dataContent}>
          <div className={`${commonStyles.smallFlexRow} ${commonStyles.itemsCenter}`}>
            <Icons.CreatingAppIcon color={WHITE} size={SMALL} />
            <span className={`${typographyStyles.desktopBodyLarge} ${typographyStyles.textWhite} ${typographyStyles.opacity70}`}>Running: </span>
            <span className={`${typographyStyles.desktopBodyLarge} ${typographyStyles.textWhite} ${styles.dataContentElement}`} title='00'>{runningApps}</span>
          </div>
          <VerticalSeparator color={WHITE} backgroundColorOpacity={OPACITY_30} classes={styles.verticalSeparator} />
          <div className={`${commonStyles.smallFlexRow} ${commonStyles.itemsCenter}`}>
            <Icons.StoppedAppIcon color={WHITE} size={SMALL} />
            <span className={`${typographyStyles.desktopBodyLarge} ${typographyStyles.textWhite} ${typographyStyles.opacity70}`}>Stopped: </span>
            <span className={`${typographyStyles.desktopBodyLarge} ${typographyStyles.textWhite} ${styles.dataContentElement}`} title='00'>{stoppedApps}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

TopContent.propTypes = {
  /**
   * runningApps
    */
  runningApps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  /**
   * stoppedApps
    */
  stoppedApps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
}

TopContent.defaultProps = {
  runningApps: '-',
  stoppedApps: '-'
}

export default TopContent
