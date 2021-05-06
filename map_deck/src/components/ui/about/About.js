import React, { useContext } from 'react'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'

import styles from './About.module.scss'

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import InstagramIcon from '@material-ui/icons/Instagram'
import TwitterIcon from '@material-ui/icons/Twitter'
import YouTubeIcon from '@material-ui/icons/YouTube'
import RssFeedIcon from '@material-ui/icons/RssFeed'

// Idle
import { useIdleTimer } from 'react-idle-timer'

// Custom icons
import { Facebook as FacebookIcon, Flickr as FlickrIcon, Pinterest as PinterestIcon } from '../icons/icons'
import { UIContext } from '../../../context/UIContext'

export const About = () => {
  const [open, setOpen] = React.useState(false)
  const [uiState] = useContext(UIContext)

  const { appMode } = uiState

  useIdleTimer({
    timeout: process.env.REACT_APP_IDLE_TIMEOUT_ABOUT,
    onIdle: (_) => {
      setOpen(false)
    }
  })

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>

      {appMode &&
      (
        <Link
          component='a'
          variant='body2'
          onClick={handleOpen}
          className={[
            styles.btnAbout,
            ...(appMode === 'kiosk' ? [styles.kiosk] : [])
          ].join(' ')}
        >
          <InfoOutlinedIcon />
        </Link>
      )}

      <Modal
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
        className={styles.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        disableAutoFocus
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={open}>
          <>
            <Grid
              container
              className={styles.container}
              direction='row'
              justify='center'
              alignItems='center'
              onClick={handleClose}
            >
              <Grid item xs={8} className={styles.content}>

                <span className={styles.close}><HighlightOffIcon /></span>

                <h2>Subplot</h2>

                <p>SubPlot is the latest DX Lab experiment and uses a significant collection of <a href='https://www.sl.nsw.gov.au/research-and-collections/significant-collections/subdivision-plans' target='_blank' rel='noopener noreferrer'>subdivision plans</a>, also known as estate maps that are part of the Library's extensive map collection. The Library has acquired over 40,000 of these ephemeral advertising posters. Mostly produced from the 1860s to the 1930s, these popular posters advertised new subdivisions and the sale of land.</p>

                <p>They were originally produced by real estate agents to promote the merits of newly created estates and subdivisions.  Printed in both colour and black &amp; white, these advertising materials illustrate the early development of the real estate industry in Australia, highlight changes in the way land was subdivided, streets were named and properties were valued and reflect the spread of suburbs across Sydney and regional areas. Subdivision plans were fleeting items, not meant to last beyond the land auction and many would have been discarded by real estate agencies once a property was sold.</p>

                <p>Users can explore the collection in a three-dimensional interface with plans cropped and positioned over a modern-day map of where they represent. Clicking on a plan presents the user with a zoomable maximum resolution version. It is possible to filter the plans by year and search for items related to a particular location.</p>

                <p>This particular data set has not been experimented with before and our aim has been to research a new way to access these plans in the browser and therefore promote the information contained within them.</p>

                <div className={styles.footer}>
                  {appMode !== 'kiosk' &&
                  (
                    <>
                      <ul className={styles.footerLinks}>
                        <li><a href='https://www.sl.nsw.gov.au/disclaimer'>Disclaimer</a></li>
                        <li><a href='https://www.sl.nsw.gov.au/privacy/web-privacy-statement'>Privacy</a></li>
                        <li><a href='https://www.sl.nsw.gov.au/copyright'>Copyright</a></li>
                        <li><a href='https://www.sl.nsw.gov.au/right-to-information'>Right to information</a></li>
                        <li><a href='https://creativecommons.org/licenses/by/4.0/' target='_blank' rel='noopener noreferrer' className='footer__cc'>CC by 4.0</a></li>
                      </ul>

                      <div className={styles.footerSocial}>
                        <a href='https://www.facebook.com/statelibrarynsw' aria-label='Follow us on Facebook'>
                          <FacebookIcon />
                        </a>
                        <a href='https://twitter.com/statelibrarynsw' aria-label='Follow us on Twitter'>
                          <TwitterIcon />
                        </a>
                        <a href='https://www.youtube.com/statelibrarynewsouthwales' aria-label='Follow us on Youtube'>
                          <YouTubeIcon />
                        </a>
                        <a href='http://instagram.com/statelibrarynsw' aria-label='Follow us on Instagram'>
                          <InstagramIcon />
                        </a>
                        <a href='https://www.flickr.com/photos/29454428@N08/' aria-label='Follow us on Flickr'>
                          <FlickrIcon />
                        </a>
                        <a href='http://pinterest.com/statelibrarynsw' aria-label='Follow us on Pinterest'>
                          <PinterestIcon />
                        </a>
                        <a href='http://dxlab.sl.nsw.gov.au/feed/' aria-label='Follow us on RSS'>
                          <RssFeedIcon />
                        </a>
                      </div>
                    </>
                  )}
                  <div className={styles.footerNSW}>
                    <a href='https://www.nsw.gov.au/' target='_blank' rel='noopener noreferrer'>
                      <img alt='NSW Government logo.' src='./images/logo-nsw-white.png' className={styles.nswLogo} />
                    </a>
                  </div>
                </div>

              </Grid>
            </Grid>

          </>
        </Fade>
      </Modal>

    </>
  )
}
