'use strict'
import React, { useState, useEffect, useRef } from 'react'
import { RICH_BLACK, WHITE, OPACITY_30, TRANSPARENT, MARGIN_0, MEDIUM } from '@platformatic/ui-components/src/components/constants'
import styles from './ApplicationLogs.module.css'
import typographyStyles from '~/styles/Typography.module.css'
import commonStyles from '~/styles/CommonStyles.module.css'
// import { Button, HorizontalSeparator, VerticalSeparator } from '@platformatic/ui-components'
import { BorderedBox, Button, HorizontalSeparator } from '@platformatic/ui-components'
import Forms from '@platformatic/ui-components/src/components/forms'
import Log from './Log'
import { PRETTY, RAW, DIRECTION_UP, DIRECTION_DOWN, DIRECTION_STILL, STATUS_PAUSED_LOGS, STATUS_RESUMED_LOGS, STATUS_STOPPED, FILTER_ALL, APPLICATION_PAGE_LOGS } from '~/ui-constants'
import LogFilterSelector from './LogFilterSelector'
import {
  callApiStartLogs,
  callApiStopLogs,
  getAppLogs,
  callApiGetAllLogs,
  callApiPauseLogs,
  callApiResumeLogs,
  callApiGetPreviousLogs
} from '~/api'
import Icons from '@platformatic/ui-components/src/components/icons'
import useStackablesStore from '~/useStackablesStore'

const ApplicationLogs = React.forwardRef(({ _props }, ref) => {
  const globalState = useStackablesStore()
  const { setNavigation, setCurrentPage } = globalState
  const applicationStatus = globalState.computed.applicationStatus
  const applicationSelected = globalState.computed.applicationSelected
  const [displayLog, setDisplayLog] = useState(PRETTY)
  const [filterLogsByService, setFilterLogsByService] = useState({ label: 'All Services', value: FILTER_ALL })
  const [filterLogsByLevel, setFilterLogsByLevel] = useState('')
  const [filtersInitialized, setFiltersInitialized] = useState(false)
  const [defaultOptionsSelected, setDefaultOptionsSelected] = useState(null)
  const [optionsServices, setOptionsServices] = useState([{ label: 'All Services', value: FILTER_ALL }])
  const [scrollDirection, setScrollDirection] = useState(DIRECTION_DOWN)
  const [logValue, setLogValue] = useState(null)
  const [applicationLogs, setApplicationLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const logContentRef = useRef()
  const [previousScrollTop, setPreviousScrollTop] = useState(0)
  const [displayGoToTop, setDisplayGoToTop] = useState(false)
  const [displayGoToBottom, setDisplayGoToBottom] = useState(false)
  const [showPreviousLogs, setShowPreviousLogs] = useState(true)
  const [statusPausedLogs, setStatusPausedLogs] = useState('')
  const [filteredLogsLengthAtPause, setFilteredLogsLengthAtPause] = useState(0)

  useEffect(() => {
    if (applicationSelected.id) {
      getAppLogs((_, value) => setLogValue(value))
      callApiStartLogs(applicationSelected.id)
    }
  }, [applicationSelected.id])

  useEffect(() => {
    if (logValue) {
      setApplicationLogs([...applicationLogs, ...logValue])
    }
  }, [logValue])

  useEffect(() => {
    if (scrollDirection === DIRECTION_DOWN && filteredLogs.length > 0) {
      logContentRef.current.scrollTo({
        top: logContentRef.current.scrollHeight,
        left: 0,
        behavior: 'smooth'
      })
      setPreviousScrollTop(logContentRef.current.scrollTop)
      if (statusPausedLogs === STATUS_PAUSED_LOGS) {
        setStatusPausedLogs(STATUS_RESUMED_LOGS)
      }
    }
    if (scrollDirection === DIRECTION_STILL) {
      setFilteredLogsLengthAtPause(filteredLogs.length)
    }
  }, [scrollDirection, filteredLogs])

  useEffect(() => {
    if (statusPausedLogs) {
      switch (statusPausedLogs) {
        case STATUS_PAUSED_LOGS:
          callApiPauseLogs()
          break

        case STATUS_RESUMED_LOGS:
          callApiResumeLogs()
          break

        default:
          break
      }
    }
  }, [statusPausedLogs])

  function handleScroll (event) {
    if (event.currentTarget.scrollTop < previousScrollTop) {
      setScrollDirection(DIRECTION_UP)
      setStatusPausedLogs(STATUS_PAUSED_LOGS)
    }
    // 30 Height of a single line
    if (event.currentTarget.scrollTop * 30 > logContentRef.current.clientHeight) {
      setDisplayGoToTop(true)
    } else {
      setDisplayGoToTop(false)
    }
  }

  useEffect(() => {
    setNavigation({
      label: 'Logs',
      handleClick: () => {
        setCurrentPage(APPLICATION_PAGE_LOGS)
      },
      key: APPLICATION_PAGE_LOGS,
      page: APPLICATION_PAGE_LOGS
    }, 2)

    return () => callApiStopLogs()
  }, [])

  useEffect(() => {
    if (applicationLogs.length > 0) {
      const newServices = applicationLogs.map(log => JSON.parse(log).name).filter(onlyUnique).map(ele => {
        if (!optionsServices.find(element => element.value === ele)) {
          return { value: ele, label: ele }
        }
        return undefined
      }).filter(ele => !!ele)
      setOptionsServices([...optionsServices, ...newServices])

      if (!filtersInitialized) {
        if (newServices.length === 1) {
          setFilterLogsByService({ value: newServices[0].value, label: newServices[0].label })
          setDefaultOptionsSelected({ value: newServices[0].value, label: newServices[0].label })
        }
        setFilterLogsByLevel(30)
        setFiltersInitialized(true)
        return
      }

      if (filterLogsByLevel || filterLogsByService.value) {
        let founds = [...applicationLogs]
        founds = founds.filter(log => JSON.parse(log).level >= filterLogsByLevel)
        if (filterLogsByService.value !== null && filterLogsByService.value !== FILTER_ALL) {
          founds = founds.filter(log => {
            return JSON.parse(log).name.toLowerCase().includes(filterLogsByService.value.toLowerCase()
            )
          })
        }
        setFilteredLogs(founds)
      } else {
        setFilteredLogs([...applicationLogs])
      }
    }
  }, [
    applicationLogs,
    filtersInitialized,
    filterLogsByLevel,
    filterLogsByService
  ])

  useEffect(() => {
    if (scrollDirection !== DIRECTION_DOWN && filteredLogsLengthAtPause > 0 && filteredLogsLengthAtPause < filteredLogs.length) {
      setDisplayGoToBottom(true)
    }
  }, [scrollDirection, filteredLogs.length, filteredLogsLengthAtPause])

  function handleSelectService (event) {
    setFilterLogsByService({
      label: event.detail.label,
      value: event.detail.value
    })
  }

  function clickGoToTop () {
    setScrollDirection(DIRECTION_UP)
    logContentRef.current.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  function resumeScrolling () {
    setScrollDirection(DIRECTION_DOWN)
    setDisplayGoToBottom(false)
    setFilteredLogsLengthAtPause(0)
  }

  async function loadPreviousLogs () {
    try {
      const response = await callApiGetPreviousLogs(applicationSelected.id)
      if (response.length > 0) {
        setApplicationLogs([...response, ...applicationLogs])
      } else {
        setShowPreviousLogs(false)
      }
    } catch (error) {
      console.error(`Error on load previous logs ${error}`)
    }
  }

  function onlyUnique (value, index, array) {
    return array.indexOf(value) === index
  }

  function handlingClickArrow () {
    setScrollDirection(DIRECTION_STILL)
    setFilteredLogsLengthAtPause(filteredLogs.length)
  }

  return (
    <div className={styles.container} ref={ref}>
      <div className={styles.content}>
        <div className={`${commonStyles.largeFlexBlock} ${commonStyles.fullWidth}`}>
          <div className={commonStyles.mediumFlexBlock}>
            <div className={`${commonStyles.smallFlexRow} ${commonStyles.fullWidth} ${commonStyles.itemsCenter}`}>
              <Icons.CodeTestingIcon color={WHITE} size={MEDIUM} />
              <h2 className={`${typographyStyles.desktopHeadline2} ${typographyStyles.textWhite}`}>Logs</h2>
              {applicationStatus === STATUS_STOPPED && <p className={`${typographyStyles.desktopBodySmall} ${typographyStyles.textWhite} ${typographyStyles.opacity70}`}>(The application is stopped. Restart the app to collect new logs.)</p>}
            </div>
          </div>
          <BorderedBox classes={styles.borderexBoxContainer} backgroundColor={RICH_BLACK} color={WHITE} borderColorOpacity={OPACITY_30}>
            <div className={`${commonStyles.tinyFlexRow} ${commonStyles.itemsCenter} ${commonStyles.justifyBetween} ${styles.lateralPadding} ${styles.top}`}>
              <Forms.Select
                defaultContainerClassName={styles.select}
                backgroundColor={RICH_BLACK}
                borderColor={WHITE}
                options={optionsServices}
                disabled={optionsServices.length <= 1}
                onSelect={handleSelectService}
                optionsBorderedBottom={false}
                optionSelected={defaultOptionsSelected}
                mainColor={WHITE}
                borderListColor={WHITE}
                value={filterLogsByService.label}
                inputTextClassName={`${typographyStyles.desktopBodySmall} ${typographyStyles.textWhite}`}
              />
              <LogFilterSelector defaultLevelSelected={30} onChangeLevelSelected={(level) => setFilterLogsByLevel(level)} />
              <div className={`${commonStyles.tinyFlexRow} ${commonStyles.justifyEnd} ${styles.buttonContainer}`}>
                <Button
                  type='button'
                  paddingClass={commonStyles.buttonPadding}
                  label='Pretty'
                  onClick={() => setDisplayLog(PRETTY)}
                  color={WHITE}
                  backgroundColor={RICH_BLACK}
                  selected={displayLog === PRETTY}
                />
                <Button
                  type='button'
                  paddingClass={commonStyles.buttonPadding}
                  label='Raw'
                  onClick={() => setDisplayLog(RAW)}
                  color={WHITE}
                  backgroundColor={TRANSPARENT}
                  selected={displayLog === RAW}
                />
              </div>
            </div>
            <HorizontalSeparator marginBottom={MARGIN_0} marginTop={MARGIN_0} color={WHITE} opacity={OPACITY_30} />
            <div className={`${styles.logsContainer} ${styles.lateralPadding}`} ref={logContentRef} onScroll={handleScroll}>
              {showPreviousLogs && (
                <div className={styles.previousLogContainer}>
                  <p className={`${typographyStyles.desktopBodySmall} ${typographyStyles.textWhite} ${typographyStyles.textCenter} ${commonStyles.fullWidth} `}><span className={`${commonStyles.cursorPointer} ${typographyStyles.textTertiaryBlue}`} onClick={() => loadPreviousLogs()}>Click Here</span> to load previous logs</p>
                </div>
              )}

              {filteredLogs?.length > 0 && (
                <>
                  <hr className={styles.logDividerTop} />
                  {filteredLogs.map((log, index) => <Log key={index} log={log} display={displayLog} onClickArrow={() => handlingClickArrow()} />)}
                  <hr className={styles.logDividerBottom} />
                </>
              )}
            </div>
            <HorizontalSeparator marginBottom={MARGIN_0} marginTop={MARGIN_0} color={WHITE} opacity={OPACITY_30} />
            <div className={`${commonStyles.tinyFlexRow} ${commonStyles.itemsCenter} ${commonStyles.justifyBetween} ${styles.lateralPadding} ${styles.bottom}`}>
              <Button
                type='button'
                paddingClass={commonStyles.buttonPadding}
                label='Go to Top'
                onClick={() => clickGoToTop()}
                color={displayGoToTop ? WHITE : RICH_BLACK}
                backgroundColor={RICH_BLACK}
                disabled={!displayGoToTop}
              />

              {displayGoToBottom
                ? (
                  <p className={`${typographyStyles.desktopBodySmall} ${typographyStyles.textWhite}`}>There are new logs. <span className={`${commonStyles.cursorPointer} ${typographyStyles.textTertiaryBlue}`} onClick={() => resumeScrolling()}>Go to the bottom</span> to resume</p>
                  )
                : (
                  <p className={`${typographyStyles.desktopBodySmall} ${typographyStyles.textRichBlack}`}>There are new logs. Go to the bottom to resume</p>
                  )}
              <Button
                type='button'
                paddingClass={commonStyles.buttonPadding}
                label='Save Logs'
                onClick={() => callApiGetAllLogs(applicationSelected.id)}
                color={WHITE}
                backgroundColor={TRANSPARENT}
              />
            </div>

          </BorderedBox>
        </div>
      </div>
    </div>
  )
})

export default ApplicationLogs
