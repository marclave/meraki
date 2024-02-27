'use strict'
import PropTypes from 'prop-types'
import typographyStyles from '~/styles/Typography.module.css'
import commonStyles from '~/styles/CommonStyles.module.css'
import { DULLS_BACKGROUND_COLOR, MAIN_GREEN, MEDIUM, RICH_BLACK, SMALL, WARNING_YELLOW, WHITE } from '@platformatic/ui-components/src/components/constants'
import { ButtonOnlyIcon, Icons, PlatformaticIcon } from '@platformatic/ui-components'
import styles from './Row.module.css'

function Row ({
  id,
  insideMeraki,
  updateVersion,
  name,
  status,
  platformaticVersion,
  onClickStop,
  onClickStart,
  onClickRestart
}) {
  function statusPills () {
    if (status === 'stopped') {
      return (
        <div className={styles.stoppedPills}>
          <Icons.CircleStopIcon color={WHITE} size={SMALL} />
          <span className={`${typographyStyles.desktopOtherOverlineNormal} ${typographyStyles.textWhite}`}>{status}</span>
        </div>
      )
    }
    return (
      <div className={styles.runningPills}>
        <Icons.RunningIcon color={MAIN_GREEN} size={SMALL} />
        <span className={`${typographyStyles.desktopOtherOverlineNormal} ${typographyStyles.textMainGreen}`}>{status}</span>

      </div>
    )
  }

  return (
    <tr className={styles.trBordered}>
      <td data-label='Name' colSpan={6}>
        <div className={`${styles.customSmallFlexRow}`}>
          {insideMeraki && <Icons.StackablesPluginIcon color={WHITE} size={MEDIUM} />}
          {!insideMeraki && (
            <PlatformaticIcon
              iconName='CLIIcon'
              color={WHITE}
              size={MEDIUM}
              tip='Application outside Meraki'
              onClick={() => {}} internalOverHandling
            />
          )}
          <span className={`${typographyStyles.desktopBodySemibold} ${typographyStyles.textWhite} ${styles.ellipsis}`} title={name}>{name}</span>
        </div>
      </td>
      <td data-label='Status' colSpan={2}>
        {statusPills()}
      </td>
      <td data-label='Plt Version' colSpan={2}>
        <div className={`${styles.customSmallFlexRow}`}>
          <span className={`${typographyStyles.desktopBody} ${typographyStyles.textWhite} ${typographyStyles.opacity70}`}>{platformaticVersion}</span>
          {updateVersion && <Icons.AlertIcon color={WARNING_YELLOW} size={SMALL} />}
        </div>
      </td>
      <td data-label='Actions' colSpan={2}>
        <div className={`${styles.buttonsContainer} `}>
          <ButtonOnlyIcon
            textClass={typographyStyles.desktopBody}
            altLabel='Start application'
            paddingClass={commonStyles.buttonSquarePadding}
            color={WHITE}
            backgroundColor={RICH_BLACK}
            onClick={() => onClickStart()}
            hoverEffect={DULLS_BACKGROUND_COLOR}
            platformaticIcon={{ size: SMALL, iconName: 'CirclePlayIcon', color: WHITE }}
            disabled={status === 'running'}
          />
          <ButtonOnlyIcon
            textClass={typographyStyles.desktopBody}
            altLabel='Stop application'
            paddingClass={commonStyles.buttonSquarePadding}
            color={WHITE}
            backgroundColor={RICH_BLACK}
            onClick={() => onClickStop()}
            hoverEffect={DULLS_BACKGROUND_COLOR}
            platformaticIcon={{ size: SMALL, iconName: 'CircleStopIcon', color: WHITE }}
            disabled={status === 'stopped'}
          />
          <ButtonOnlyIcon
            textClass={typographyStyles.desktopBody}
            altLabel='Restart application'
            paddingClass={commonStyles.buttonSquarePadding}
            color={WHITE}
            backgroundColor={RICH_BLACK}
            onClick={() => onClickRestart()}
            hoverEffect={DULLS_BACKGROUND_COLOR}
            platformaticIcon={{ size: SMALL, iconName: 'RestartIcon', color: WHITE }}
          />
        </div>
      </td>
    </tr>
  )
}

Row.propTypes = {
  /**
   * id
    */
  id: PropTypes.string.isRequired,
  /**
   * insideMeraky
    */
  insideMeraky: PropTypes.bool,
  /**
   * updateVersion
    */
  updateVersion: PropTypes.bool,
  /**
   * name
    */
  name: PropTypes.string,
  /**
   * status
    */
  status: PropTypes.string,
  /**
   * latest
    */
  platformaticVersion: PropTypes.string,
  /**
   * onClickDelete
    */
  onClickDelete: PropTypes.func,
  /**
   * onClickSave
    */
  onClickSave: PropTypes.func

}

Row.defaultProps = {
  insideMeraki: false,
  updateVersion: false,
  name: '',
  status: '',
  platformaticVersion: '-',
  onClickDelete: () => {},
  onClickSave: () => {}
}

export default Row
