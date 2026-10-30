import React from 'react'
import { Nav, Container, Row } from 'react-bootstrap';

const VideoLayout = ({ activeTab, handleTabChange, children }) => {
  return (
    <div>
     <Container className="colorAdmin pb-3">
          <Row>
            {/* Navegación por tabs */}
            <Nav variant="tabs" className="ms-2 mb-0" id="nav-tab" role="tablist">
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('facebook')} active={activeTab === 'facebook'}>
                  Facebook
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('instagram')} active={activeTab === 'instagram'}>
                  Instagram
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('youtube')} active={activeTab === 'youtube'}>
                  You Tube
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Row>
          <Container fluid className="d-flex flex-nowrap colorTab ">
            {/* Contenido dinámico */}
            {children}
          </Container>
        </Container>
    </div>
  )
}

export default VideoLayout